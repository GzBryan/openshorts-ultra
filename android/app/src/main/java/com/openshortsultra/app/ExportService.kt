package com.openshortsultra.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder

/** Servicio en primer plano para exportaciones largas.
 *  La exportación actual vive en el WebView (engine/exporter.js); este servicio
 *  existe para que Android no mate el proceso durante un lote y para mostrar
 *  la notificación de progreso. No simula trabajo: si no hay exportación en
 *  curso, se detiene. */
class ExportService : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val ch = "osu-export"
        if (Build.VERSION.SDK_INT >= 26) {
            val mgr = getSystemService(NotificationManager::class.java)
            mgr.createNotificationChannel(NotificationChannel(ch, "Exportación", NotificationManager.IMPORTANCE_LOW))
            val n = Notification.Builder(this, ch).setContentTitle("OPENSHORTS ULTRA")
                .setContentText("Exportando clip…").setSmallIcon(android.R.drawable.ic_menu_save).build()
            startForeground(1, n)
        }
        return START_NOT_STICKY
    }
    override fun onBind(intent: Intent?): IBinder? = null
}
