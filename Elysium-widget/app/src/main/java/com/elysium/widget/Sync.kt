package com.elysium.widget

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.os.Build
import android.view.View
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import java.io.File

object Sync {
    @Synchronized
    fun run(c: Context, notify: Boolean): String {
        val msg = try {
            doSync(c, notify)
        } catch (e: Throwable) {
            "❌ ${e.javaClass.simpleName}: ${e.message ?: ""}".trim()
        }
        val we = WidgetUpdater.lastError
        Prefs.setStatus(c, if (we != null) "$msg | ویجت: $we" else msg)
        // اگر هنوز چیزی روی ویجت نیست، دلیلش را روی خود ویجت نشان بده
        if (msg.startsWith("❌") && Prefs.latest(c) == null && WidgetUpdater.lastErrShown != msg) {
            WidgetUpdater.lastErrShown = msg
            WidgetUpdater.render(c)
        }
        return msg
    }

    private fun doSync(c: Context, notify: Boolean): String {
        val user = Prefs.user(c) ?: return "هنوز کاربری انتخاب نشده"
        val item = Api.latest(user, Prefs.includeSent(c))
        if (item == null) {
            if (Prefs.latestId(c) != 0) Prefs.clearItem(c)
            WidgetUpdater.lastErrShown = null
            WidgetUpdater.renderIfChanged(c)
            return "✅ وصل شد؛ هنوز چیزی برای «$user» نیومده"
        }
        val cached = WidgetUpdater.cacheFile(c)
        if (item.id == Prefs.latestId(c) && (item.kind == "video" || cached.exists())) {
            WidgetUpdater.renderIfChanged(c)
            return "✅ به‌روز؛ آخرین مورد #${item.id}"
        }
        var bmp: Bitmap? = null
        if (item.kind != "video") {
            bmp = Api.bitmapStrict(item.url, 900)
            if (bmp == null) return "❌ فایل عکس خراب است"
            WidgetUpdater.saveBitmap(c, bmp)
        } else {
            cached.delete()
        }
        Prefs.saveItem(c, item)
        WidgetUpdater.render(c)
        val firstTime = Prefs.notifiedId(c) == 0
        if (notify && !firstTime && item.sender != user && item.id > Prefs.notifiedId(c)) {
            Notifier.newItem(c, item, bmp)
        }
        if (item.id > Prefs.notifiedId(c)) Prefs.setNotifiedId(c, item.id)
        return "✅ ویجت آپدیت شد؛ مورد #${item.id}"
    }
}

object Notifier {
    private const val CH_BG = "bg"
    private const val CH_NEW = "new"

    fun ensureChannels(c: Context) {
        if (Build.VERSION.SDK_INT < 26) return
        val nm = c.getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(NotificationChannel(CH_BG, "اتصال زنده", NotificationManager.IMPORTANCE_MIN))
        nm.createNotificationChannel(NotificationChannel(CH_NEW, "نقاشی و پیام جدید", NotificationManager.IMPORTANCE_HIGH))
    }

    fun foreground(c: Context) = NotificationCompat.Builder(c, CH_BG)
        .setSmallIcon(R.drawable.ic_heart)
        .setContentTitle("Elysium متصله 💞")
        .setContentText("منتظر نقاشی‌های تازه…")
        .setOngoing(true)
        .setPriority(NotificationCompat.PRIORITY_MIN)
        .setContentIntent(openApp(c, 0))
        .build()

    fun newItem(c: Context, item: Item, bmp: Bitmap?) {
        val who = if (item.sender == "matin") "متین" else "مطهره"
        val b = NotificationCompat.Builder(c, CH_NEW)
            .setSmallIcon(R.drawable.ic_heart)
            .setContentTitle("🎨 $who برات فرستاد")
            .setContentText(item.caption.ifEmpty { "یه چیز تازه روی بوم دونفره 💌" })
            .setContentIntent(openApp(c, 1))
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
        if (bmp != null) {
            b.setLargeIcon(bmp).setStyle(NotificationCompat.BigPictureStyle().bigPicture(bmp))
        }
        try {
            NotificationManagerCompat.from(c).notify(1000 + item.id, b.build())
        } catch (_: SecurityException) {
        }
    }

    private fun openApp(c: Context, code: Int): PendingIntent = PendingIntent.getActivity(
        c, code, Intent(c, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_NEW_TASK),
        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )
}

object WidgetUpdater {
    @Volatile var lastError: String? = null
    @Volatile var lastErrShown: String? = null
    @Volatile private var lastKey: String? = null

    fun cacheFile(c: Context) = File(c.filesDir, "latest.jpg")

    private fun key(c: Context) =
        "${Prefs.user(c)}|${Prefs.latestId(c)}|${cacheFile(c).lastModified()}|${Prefs.latest(c)?.seen}"

    /** فقط وقتی چیزی عوض شده ویجت را دوباره می‌سازد (برای صرفه‌جویی در باتری) */
    fun renderIfChanged(c: Context) {
        if (key(c) != lastKey || lastError != null) render(c)
    }

    private fun shrink(b: Bitmap, maxSide: Int): Bitmap {
        val m = maxOf(b.width, b.height)
        if (m <= maxSide) return b
        val r = maxSide.toFloat() / m
        return Bitmap.createScaledBitmap(b, (b.width * r).toInt().coerceAtLeast(1), (b.height * r).toInt().coerceAtLeast(1), true)
    }

    fun saveBitmap(c: Context, bmp: Bitmap) {
        cacheFile(c).outputStream().use { bmp.compress(Bitmap.CompressFormat.JPEG, 90, it) }
    }

    fun render(c: Context) {
        try {
            val mgr = AppWidgetManager.getInstance(c)
            val ids = mgr.getAppWidgetIds(ComponentName(c, DoodleWidget::class.java))
            if (ids.isNotEmpty()) mgr.updateAppWidget(ids, build(c))
            lastKey = key(c)
            lastError = null
        } catch (e: Throwable) {
            lastError = "${e.javaClass.simpleName}: ${e.message ?: ""}".take(160)
            android.util.Log.e("Elysium", "widget render failed", e)
        }
    }

    private fun build(c: Context): RemoteViews {
        val v = RemoteViews(c.packageName, R.layout.widget_doodle)
        val me = Prefs.user(c)
        val item = Prefs.latest(c)
        val open = PendingIntent.getActivity(
            c, 0, Intent(c, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        v.setOnClickPendingIntent(android.R.id.background, open)

        if (item == null || me == null) {
            v.setViewVisibility(R.id.w_empty, View.VISIBLE)
            v.setTextViewText(
                R.id.w_empty,
                when {
                    me == null -> "اپ Elysium رو باز کن و کاربرت رو انتخاب کن 💌"
                    lastErrShown != null -> "نتونستم به سرور وصل بشم\n${lastErrShown}"
                    else -> "هنوز چیزی نیومده…\nمنتظر نقاشی بعدی 💌"
                },
            )
            v.setViewVisibility(R.id.w_img, View.GONE)
            v.setViewVisibility(R.id.w_placeholder, View.GONE)
            v.setViewVisibility(R.id.w_overlay, View.GONE)
            v.setViewVisibility(R.id.w_badge, View.GONE)
            return v
        }

        v.setViewVisibility(R.id.w_empty, View.GONE)
        var shown = false
        val f = cacheFile(c)
        if (item.kind != "video" && f.exists()) {
            val bmp = Api.decode(f.readBytes(), 512)?.let { shrink(it, 700) }
            if (bmp != null) {
                v.setImageViewBitmap(R.id.w_img, bmp)
                shown = true
            }
        }
        v.setViewVisibility(R.id.w_img, if (shown) View.VISIBLE else View.GONE)
        v.setViewVisibility(R.id.w_placeholder, if (shown) View.GONE else View.VISIBLE)

        val mine = item.sender == me
        val who = if (item.sender == "matin") "متین" else "مطهره"
        val time = if (item.createdAt.length >= 16) item.createdAt.substring(11, 16) else ""
        v.setTextViewText(R.id.w_from, (if (mine) "ارسال‌شده توسط تو" else "از طرف $who 💌") + (if (time.isEmpty()) "" else "  •  $time"))
        v.setTextViewText(R.id.w_caption, item.caption)
        v.setViewVisibility(R.id.w_caption, if (item.caption.isEmpty()) View.GONE else View.VISIBLE)
        v.setViewVisibility(R.id.w_overlay, View.VISIBLE)
        v.setViewVisibility(R.id.w_badge, if (!mine && !item.seen) View.VISIBLE else View.GONE)
        return v
    }
}
