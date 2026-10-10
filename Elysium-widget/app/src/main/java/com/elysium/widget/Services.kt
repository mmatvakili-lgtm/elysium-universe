package com.elysium.widget

import android.app.Service
import android.appwidget.AppWidgetManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.Worker
import androidx.work.WorkerParameters
import java.util.concurrent.TimeUnit

/** سرویس زنده: هر چند ثانیه سرور را چک می‌کند و ویجت را همان لحظه به‌روز می‌کند */
class PollService : Service() {
    companion object {
        @Volatile
        var running = false
    }

    private var thread: Thread? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Notifier.ensureChannels(this)
        val n = Notifier.foreground(this)
        if (Build.VERSION.SDK_INT >= 29) {
            startForeground(1, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
        } else {
            startForeground(1, n)
        }
        if (!running) {
            running = true
            thread = Thread {
                var fails = 0
                while (running) {
                    val base = Prefs.interval(applicationContext) * 1000L
                    var wait = base
                    try {
                        if (!Net.online(applicationContext)) {
                            wait = 30_000L
                        } else {
                            val msg = Sync.run(applicationContext, true)
                            fails = if (msg.startsWith("❌")) minOf(fails + 1, 5) else 0
                            // اگر سرور در دسترس نیست، فاصله را تا ۵ دقیقه زیاد کن تا باتری نسوزد
                            if (fails > 0) wait = minOf(base * (1L shl fails), 300_000L)
                        }
                        Thread.sleep(wait)
                    } catch (e: InterruptedException) {
                        break
                    } catch (e: Throwable) {
                        try { Thread.sleep(60_000L) } catch (_: InterruptedException) { break }
                    }
                }
                running = false
            }.also {
                it.isDaemon = true
                it.start()
            }
        }
        return START_STICKY
    }

    override fun onDestroy() {
        running = false
        thread?.interrupt()
        super.onDestroy()
    }
}

/** پشتیبان: اگر سیستم سرویس را کشت، هر ۱۵ دقیقه یک بار همگام‌سازی و راه‌اندازی دوباره */
class SyncWorker(ctx: Context, p: WorkerParameters) : Worker(ctx, p) {
    override fun doWork(): Result {
        Sync.run(applicationContext, true)
        Boot.ensureService(applicationContext)
        return Result.success()
    }

    companion object {
        fun refreshNow(c: Context) {
            WorkManager.getInstance(c).enqueue(OneTimeWorkRequestBuilder<SyncWorker>().build())
        }

        fun schedule(c: Context) {
            val req = PeriodicWorkRequestBuilder<SyncWorker>(15, TimeUnit.MINUTES).build()
            WorkManager.getInstance(c).enqueueUniquePeriodicWork("elysium_periodic", ExistingPeriodicWorkPolicy.KEEP, req)
        }
    }
}

class DoodleWidget : android.appwidget.AppWidgetProvider() {
    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        WidgetUpdater.render(context)
        Boot.ensureService(context)
        SyncWorker.refreshNow(context)
    }

    override fun onEnabled(context: Context) {
        SyncWorker.schedule(context)
    }
}

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        Boot.ensureService(context)
        SyncWorker.schedule(context)
    }
}
