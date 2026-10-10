package com.elysium.widget

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.core.content.ContextCompat
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class Item(
    val id: Int, val sender: String, val receiver: String, val kind: String,
    val url: String, val caption: String, val createdAt: String, val seen: Boolean,
) {
    fun toJson(): String = JSONObject()
        .put("id", id).put("sender", sender).put("receiver", receiver).put("kind", kind)
        .put("url", url).put("caption", caption).put("created_at", createdAt)
        .put("seen_at", if (seen) "1" else JSONObject.NULL).toString()

    companion object {
        fun from(o: JSONObject) = Item(
            o.getInt("id"), o.getString("sender"), o.optString("receiver", ""), o.getString("kind"),
            o.getString("url"), o.optString("caption", ""), o.optString("created_at", ""), !o.isNull("seen_at"),
        )
    }
}

object Prefs {
    private fun sp(c: Context) = c.getSharedPreferences("elysium", Context.MODE_PRIVATE)

    fun user(c: Context): String? = sp(c).getString("user", null)
    fun setUser(c: Context, u: String?) { sp(c).edit().putString("user", u).apply() }

    fun interval(c: Context): Int = sp(c).getInt("interval", 30).coerceAtLeast(15)
    fun setInterval(c: Context, s: Int) { sp(c).edit().putInt("interval", s).apply() }

    fun includeSent(c: Context): Boolean = sp(c).getBoolean("include_sent", false)
    fun setIncludeSent(c: Context, v: Boolean) {
        sp(c).edit().putBoolean("include_sent", v).remove("latest").remove("latest_id").apply()
    }

    fun latest(c: Context): Item? =
        sp(c).getString("latest", null)?.let { runCatching { Item.from(JSONObject(it)) }.getOrNull() }
    fun latestId(c: Context): Int = sp(c).getInt("latest_id", 0)
    fun saveItem(c: Context, it: Item) {
        sp(c).edit().putString("latest", it.toJson()).putInt("latest_id", it.id).apply()
    }
    fun clearItem(c: Context) {
        sp(c).edit().remove("latest").remove("latest_id").apply()
        WidgetUpdater.cacheFile(c).delete()
    }

    fun notifiedId(c: Context): Int = sp(c).getInt("notified_id", 0)
    fun setNotifiedId(c: Context, id: Int) { sp(c).edit().putInt("notified_id", id).apply() }

    fun status(c: Context): String = sp(c).getString("status", "هنوز همگام‌سازی نشده") ?: ""
    fun setStatus(c: Context, msg: String) {
        val t = SimpleDateFormat("HH:mm:ss", Locale.US).format(Date())
        sp(c).edit().putString("status", "$msg  ($t)").apply()
    }
}

object Api {
    const val BASE = "https://rico6.pythonanywhere.com"

    private fun open(path: String, method: String = "GET"): HttpURLConnection {
        val full = if (path.startsWith("http")) path else BASE + path
        val c = URL(full).openConnection() as HttpURLConnection
        c.requestMethod = method
        c.connectTimeout = 8000
        c.readTimeout = 12000
        return c
    }

    private fun getText(path: String): String {
        val c = open(path)
        try {
            if (c.responseCode !in 200..299) throw RuntimeException("پاسخ سرور ${c.responseCode} برای $path")
            return c.inputStream.bufferedReader().readText()
        } finally {
            c.disconnect()
        }
    }

    fun latest(user: String, includeSent: Boolean): Item? {
        val q = "/api/doodle/latest?username=$user" + if (includeSent) "&include_sent=1" else ""
        val d = JSONObject(getText(q)).optJSONObject("data") ?: return null
        return Item.from(d)
    }

    fun history(user: String): List<Item> {
        val arr = JSONObject(getText("/api/doodle/history?username=$user")).optJSONArray("data") ?: return emptyList()
        return (0 until arr.length()).map { Item.from(arr.getJSONObject(it)) }
    }

    fun markSeen(user: String, id: Int) {
        val c = open("/api/doodle/seen", "POST")
        c.doOutput = true
        c.setRequestProperty("Content-Type", "application/json")
        c.outputStream.use { it.write("""{"username":"$user","id":$id}""".toByteArray()) }
        c.responseCode
        c.disconnect()
    }

    fun delete(user: String, id: Int) {
        val c = open("/api/doodle/$id?username=$user", "DELETE")
        c.responseCode
        c.disconnect()
    }

    /** برمی‌گرداند null اگر موفق بود، وگرنه متن خطا */
    fun send(user: String, kind: String, bytes: ByteArray, filename: String, mime: String, caption: String): String? {
        val boundary = "----elysium" + System.currentTimeMillis()
        val c = open("/api/doodle/send", "POST")
        c.doOutput = true
        c.readTimeout = 60000
        c.setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")
        c.outputStream.use { out ->
            fun field(n: String, v: String) {
                out.write("--$boundary\r\nContent-Disposition: form-data; name=\"$n\"\r\n\r\n$v\r\n".toByteArray())
            }
            field("username", user)
            field("kind", kind)
            field("caption", caption)
            out.write("--$boundary\r\nContent-Disposition: form-data; name=\"file\"; filename=\"$filename\"\r\nContent-Type: $mime\r\n\r\n".toByteArray())
            out.write(bytes)
            out.write("\r\n--$boundary--\r\n".toByteArray())
        }
        val code = c.responseCode
        val body = (if (code in 200..299) c.inputStream else c.errorStream)?.bufferedReader()?.readText() ?: ""
        c.disconnect()
        if (code in 200..299) return null
        val msg = runCatching { JSONObject(body).optString("message") }.getOrNull()
        return if (msg.isNullOrEmpty()) "خطای سرور ($code)" else msg
    }

    fun decode(bytes: ByteArray, maxPx: Int): Bitmap? {
        val o = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeByteArray(bytes, 0, bytes.size, o)
        var s = 1
        while (o.outWidth / (s * 2) >= maxPx || o.outHeight / (s * 2) >= maxPx) s *= 2
        val o2 = BitmapFactory.Options().apply { inSampleSize = s }
        return BitmapFactory.decodeByteArray(bytes, 0, bytes.size, o2)
    }

    /** مثل bitmap ولی خطای واقعی (شبکه/۴۰۴/…) را پرتاب می‌کند تا در وضعیت دیده شود */
    fun bitmapStrict(path: String, maxPx: Int): Bitmap? {
        val c = open(path)
        c.readTimeout = 25000
        try {
            if (c.responseCode !in 200..299) throw RuntimeException("دانلود عکس: پاسخ ${c.responseCode}")
            val bytes = c.inputStream.use { it.readBytes() }
            return decode(bytes, maxPx)
        } finally {
            c.disconnect()
        }
    }

    fun bitmap(path: String, maxPx: Int): Bitmap? = try {
        bitmapStrict(path, maxPx)
    } catch (e: Exception) {
        null
    }
}

object Net {
    fun online(c: Context): Boolean = try {
        val cm = c.getSystemService(android.net.ConnectivityManager::class.java)
        val n = cm.activeNetwork
        val caps = if (n == null) null else cm.getNetworkCapabilities(n)
        caps?.hasCapability(android.net.NetworkCapabilities.NET_CAPABILITY_INTERNET) == true
    } catch (e: Exception) {
        true
    }
}

object Boot {
    fun ensureService(c: Context) {
        if (Prefs.user(c) == null) return
        try {
            ContextCompat.startForegroundService(c, Intent(c, PollService::class.java))
        } catch (_: Exception) {
        }
    }
}
