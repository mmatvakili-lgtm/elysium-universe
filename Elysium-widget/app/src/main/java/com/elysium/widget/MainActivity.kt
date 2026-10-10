package com.elysium.widget

import android.Manifest
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.LruCache
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.foundation.shape.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.draw.*
import androidx.compose.ui.geometry.*
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.*
import androidx.compose.ui.input.pointer.*
import androidx.compose.ui.layout.*
import androidx.compose.ui.platform.*
import androidx.compose.ui.text.font.*
import androidx.compose.ui.text.style.*
import androidx.compose.ui.unit.*
import androidx.compose.ui.window.*
import androidx.core.content.ContextCompat
import kotlinx.coroutines.*
import java.io.ByteArrayOutputStream

// ---------- رنگ‌های Elysium ----------
val Bg = Color(0xFF0B0D14)
val CanvasBg = Color(0xFF12141C)
val Orange = Color(0xFFF97B22)
val Cream = Color(0xFFFEE8B0)
val Sage = Color(0xFF7C9070)
val Pink = Color(0xFFFF6B9D)
val PALETTE = listOf(Orange, Cream, Pink, Color(0xFF6BC7FF), Color(0xFFB5E48C), Color(0xFFC77DFF), Color.White)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(colorScheme = darkColorScheme(primary = Orange, background = Bg, surface = Bg, onSurface = Cream, onBackground = Cream)) {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(modifier = Modifier.fillMaxSize(), color = Bg) { App() }
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        Boot.ensureService(this)
        SyncWorker.schedule(this)
    }
}

// ---------- اجزای مشترک ----------
@Composable
fun Glass(modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    Column(
        modifier.clip(RoundedCornerShape(20.dp)).background(Color(0x0FFFFFFF))
            .border(1.dp, Color(0x1FFFFFFF), RoundedCornerShape(20.dp)).padding(16.dp),
        content = content,
    )
}

@Composable
fun GradButton(text: String, modifier: Modifier = Modifier, enabled: Boolean = true, onClick: () -> Unit) {
    Box(
        modifier.clip(RoundedCornerShape(16.dp)).background(Brush.horizontalGradient(listOf(Orange, Sage)))
            .alpha(if (enabled) 1f else 0.5f).clickable(enabled = enabled, onClick = onClick).padding(vertical = 14.dp),
        contentAlignment = Alignment.Center,
    ) { Text(text, color = Color(0xFF111111), fontWeight = FontWeight.Bold, fontSize = 15.sp) }
}

@Composable
fun OutlineBtn(text: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Box(
        modifier.clip(RoundedCornerShape(16.dp)).border(1.dp, Orange.copy(alpha = 0.7f), RoundedCornerShape(16.dp))
            .clickable(onClick = onClick).padding(vertical = 13.dp, horizontal = 16.dp),
        contentAlignment = Alignment.Center,
    ) { Text(text, color = Orange, fontWeight = FontWeight.Bold, fontSize = 14.sp) }
}

@Composable
fun ToolBtn(label: String, active: Boolean = false, onClick: () -> Unit) {
    Box(
        Modifier.size(42.dp).clip(RoundedCornerShape(12.dp))
            .background(if (active) Orange.copy(alpha = 0.25f) else Color(0x14FFFFFF))
            .border(1.dp, if (active) Orange else Color(0x1FFFFFFF), RoundedCornerShape(12.dp)).clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) { Text(label, fontSize = 18.sp) }
}

object ImgCache { val lru = LruCache<String, Bitmap>(40) }

@Composable
fun NetImage(path: String, modifier: Modifier, maxPx: Int = 600) {
    var bmp by remember(path) { mutableStateOf<Bitmap?>(ImgCache.lru.get(path)) }
    LaunchedEffect(path) {
        if (bmp == null) {
            val b = withContext(Dispatchers.IO) { Api.bitmap(path, maxPx) }
            if (b != null) { ImgCache.lru.put(path, b); bmp = b }
        }
    }
    val b = bmp
    if (b != null) Image(b.asImageBitmap(), null, modifier, contentScale = ContentScale.Crop)
    else Box(modifier.background(Color(0x14FFFFFF)))
}

// ---------- ریشه ----------
@Composable
fun App() {
    val ctx = LocalContext.current
    var user by remember { mutableStateOf(Prefs.user(ctx)) }
    val u = user
    if (u == null) {
        Welcome { picked ->
            Prefs.setUser(ctx, picked)
            Prefs.clearItem(ctx)
            WidgetUpdater.render(ctx)
            user = picked
            Boot.ensureService(ctx)
            SyncWorker.refreshNow(ctx)
        }
    } else {
        Home(u) {
            ctx.stopService(Intent(ctx, PollService::class.java))
            Prefs.setUser(ctx, null)
            Prefs.clearItem(ctx)
            WidgetUpdater.render(ctx)
            user = null
        }
    }
}

@Composable
fun Welcome(onPick: (String) -> Unit) {
    Column(Modifier.fillMaxSize().padding(28.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
        Text("∞", fontSize = 76.sp, color = Orange, fontWeight = FontWeight.Black)
        Text("Elysium", fontSize = 40.sp, fontWeight = FontWeight.Black, color = Cream)
        Text("دروازه‌ی اختصاصی کهکشانِ ما ✨", color = Cream.copy(alpha = 0.6f), modifier = Modifier.padding(top = 6.dp, bottom = 40.dp))
        Text("تو کی هستی؟", color = Cream, fontSize = 18.sp, modifier = Modifier.padding(bottom = 14.dp))
        PickCard("متین", "💫") { onPick("matin") }
        Spacer(Modifier.height(12.dp))
        PickCard("مطهره", "🌸") { onPick("moti") }
    }
}

@Composable
fun PickCard(name: String, emoji: String, onClick: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(Brush.horizontalGradient(listOf(Color(0x33F97B22), Color(0x337C9070))))
            .border(1.dp, Color(0x33FEE8B0), RoundedCornerShape(20.dp)).clickable(onClick = onClick).padding(20.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(emoji, fontSize = 30.sp)
        Spacer(Modifier.width(14.dp))
        Text(name, color = Cream, fontSize = 20.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun Home(user: String, onLogout: () -> Unit) {
    val ctx = LocalContext.current
    var tab by remember { mutableIntStateOf(0) }
    val notifLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { _ -> }
    LaunchedEffect(Unit) {
        if (Build.VERSION.SDK_INT >= 33 &&
            ContextCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) notifLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        withContext(Dispatchers.IO) {
            Prefs.latest(ctx)?.let { if (it.sender != user && !it.seen) runCatching { Api.markSeen(user, it.id) } }
        }
    }
    Column(Modifier.fillMaxSize()) {
        Header(user)
        Box(Modifier.weight(1f)) {
            when (tab) {
                0 -> DrawTab(user)
                1 -> GalleryTab(user)
                else -> SettingsTab(onLogout)
            }
        }
        BottomBar(tab) { tab = it }
    }
}

@Composable
fun Header(user: String) {
    var live by remember { mutableStateOf(PollService.running) }
    LaunchedEffect(Unit) { while (true) { live = PollService.running; delay(2000) } }
    Row(Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 14.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text(if (user == "matin") "سلام متین 💫" else "سلام مطهره جان 🌸", color = Cream, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Text("Elysium Universe", color = Orange, fontSize = 12.sp)
        }
        Box(
            Modifier.clip(RoundedCornerShape(50)).background(if (live) Sage.copy(alpha = 0.25f) else Color(0x33FF4D4D))
                .padding(horizontal = 12.dp, vertical = 6.dp),
        ) { Text(if (live) "● زنده" else "● آفلاین", color = if (live) Color(0xFFA8D5A2) else Color(0xFFFF8A8A), fontSize = 12.sp) }
    }
}

@Composable
fun BottomBar(sel: Int, onSel: (Int) -> Unit) {
    val items = listOf("🎨" to "بوم", "🖼️" to "گالری", "⚙️" to "تنظیمات")
    Row(Modifier.fillMaxWidth().background(Color(0xFF10131B)).padding(8.dp), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        items.forEachIndexed { i, pair ->
            Column(
                Modifier.weight(1f).clip(RoundedCornerShape(14.dp))
                    .background(if (sel == i) Orange.copy(alpha = 0.18f) else Color.Transparent)
                    .clickable { onSel(i) }.padding(vertical = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(pair.first, fontSize = 20.sp)
                Text(pair.second, fontSize = 11.sp, color = if (sel == i) Orange else Cream.copy(alpha = 0.6f))
            }
        }
    }
}

// ---------- بوم نقاشی ----------
class Ink(val color: Color, val w: Float, val pts: MutableList<Offset>)

fun renderInk(strokes: List<Ink>, w: Int, h: Int): ByteArray {
    val bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
    val cv = android.graphics.Canvas(bmp)
    cv.drawColor(CanvasBg.toArgb())
    val p = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG)
    p.strokeCap = android.graphics.Paint.Cap.ROUND
    p.strokeJoin = android.graphics.Paint.Join.ROUND
    strokes.forEach { s ->
        p.color = s.color.toArgb()
        if (s.pts.size == 1) {
            p.style = android.graphics.Paint.Style.FILL
            cv.drawCircle(s.pts[0].x * w, s.pts[0].y * h, s.w * w / 2f, p)
        } else {
            p.style = android.graphics.Paint.Style.STROKE
            p.strokeWidth = s.w * w
            val path = android.graphics.Path()
            path.moveTo(s.pts[0].x * w, s.pts[0].y * h)
            s.pts.drop(1).forEach { path.lineTo(it.x * w, it.y * h) }
            cv.drawPath(path, p)
        }
    }
    val out = ByteArrayOutputStream()
    bmp.compress(Bitmap.CompressFormat.PNG, 100, out)
    return out.toByteArray()
}

@Composable
fun DrawTab(user: String) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val strokes = remember { mutableStateListOf<Ink>() }
    var tick by remember { mutableIntStateOf(0) }
    var color by remember { mutableStateOf(Orange) }
    var eraser by remember { mutableStateOf(false) }
    var brush by remember { mutableFloatStateOf(0.014f) }
    var caption by remember { mutableStateOf("") }
    var status by remember { mutableStateOf("") }
    var sending by remember { mutableStateOf(false) }

    val picker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) scope.launch {
            sending = true
            status = "در حال فرستادن عکس… ✨"
            val err: String? = withContext(Dispatchers.IO) {
                try {
                    val raw = ctx.contentResolver.openInputStream(uri)!!.use { it.readBytes() }
                    val bmp = Api.decode(raw, 1600)
                    if (bmp == null) {
                        "فایل عکس معتبر نیست"
                    } else {
                        val out = ByteArrayOutputStream()
                        bmp.compress(Bitmap.CompressFormat.JPEG, 85, out)
                        Api.send(user, "image", out.toByteArray(), "photo.jpg", "image/jpeg", caption.trim())
                    }
                } catch (e: Exception) {
                    "اتصال برقرار نشد"
                }
            }
            if (err == null) { status = "فرستاده شد 💌"; caption = "" } else status = "❌ $err"
            sending = false
        }
    }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 16.dp, vertical = 4.dp)) {
        Canvas(
            Modifier.fillMaxWidth().aspectRatio(0.8f).clip(RoundedCornerShape(20.dp)).background(CanvasBg)
                .border(1.dp, Color(0x1FFFFFFF), RoundedCornerShape(20.dp))
                .pointerInput(Unit) {
                    awaitEachGesture {
                        val down = awaitFirstDown()
                        down.consume()
                        val w = size.width.toFloat()
                        val h = size.height.toFloat()
                        val ink = Ink(if (eraser) CanvasBg else color, brush, mutableListOf(Offset(down.position.x / w, down.position.y / h)))
                        strokes.add(ink)
                        tick++
                        drag(down.id) { ch ->
                            ink.pts.add(Offset(ch.position.x / w, ch.position.y / h))
                            tick++
                            ch.consume()
                        }
                    }
                },
        ) {
            val t = tick
            if (t >= 0) {
                strokes.forEach { s ->
                    if (s.pts.size == 1) {
                        drawCircle(s.color, s.w * size.width / 2f, Offset(s.pts[0].x * size.width, s.pts[0].y * size.height))
                    } else {
                        val path = Path()
                        path.moveTo(s.pts[0].x * size.width, s.pts[0].y * size.height)
                        s.pts.drop(1).forEach { path.lineTo(it.x * size.width, it.y * size.height) }
                        drawPath(path, s.color, style = Stroke(width = s.w * size.width, cap = StrokeCap.Round, join = StrokeJoin.Round))
                    }
                }
            }
        }

        Row(Modifier.fillMaxWidth().padding(top = 12.dp), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
            PALETTE.forEach { c ->
                val sel = !eraser && color == c
                Box(
                    Modifier.size(if (sel) 34.dp else 28.dp).clip(CircleShape).background(c)
                        .border(2.dp, if (sel) Cream else Color(0x33FFFFFF), CircleShape)
                        .clickable { color = c; eraser = false },
                )
            }
        }
        Row(Modifier.fillMaxWidth().padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            Slider(
                value = brush, onValueChange = { brush = it }, valueRange = 0.006f..0.06f, modifier = Modifier.weight(1f),
                colors = SliderDefaults.colors(thumbColor = Orange, activeTrackColor = Orange),
            )
            ToolBtn("🧽", eraser) { eraser = !eraser }
            ToolBtn("↩️") { if (strokes.isNotEmpty()) strokes.removeAt(strokes.size - 1) }
            ToolBtn("🗑️") { strokes.clear() }
        }

        OutlinedTextField(
            value = caption, onValueChange = { if (it.length <= 200) caption = it },
            placeholder = { Text("یه جمله‌ی کوچولو کنارش بنویس… (اختیاری)", fontSize = 13.sp) },
            singleLine = true, shape = RoundedCornerShape(14.dp), modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Sage, unfocusedBorderColor = Color(0x33FFFFFF), cursorColor = Orange,
                focusedTextColor = Color.White, unfocusedTextColor = Color.White,
            ),
        )
        Row(Modifier.fillMaxWidth().padding(top = 12.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            GradButton("بفرست روی صفحه‌ی او 💌", Modifier.weight(1f), enabled = !sending) {
                if (strokes.isEmpty()) {
                    status = "اول یه چیزی بکش 🎨"
                } else scope.launch {
                    sending = true
                    status = "در حال فرستادن… ✨"
                    val png = renderInk(strokes.toList(), 800, 1000)
                    val err: String? = withContext(Dispatchers.IO) {
                        try { Api.send(user, "drawing", png, "doodle.png", "image/png", caption.trim()) } catch (e: Exception) { "اتصال برقرار نشد" }
                    }
                    if (err == null) { strokes.clear(); caption = ""; status = "فرستاده شد 💌" } else status = "❌ $err"
                    sending = false
                }
            }
            OutlineBtn("📷 عکس") { picker.launch("image/*") }
        }
        if (status.isNotEmpty()) Text(status, color = Cream.copy(alpha = 0.8f), fontSize = 13.sp, modifier = Modifier.padding(top = 10.dp, bottom = 16.dp))
        else Spacer(Modifier.height(16.dp))
    }
}

// ---------- گالری ----------
@Composable
fun GalleryTab(user: String) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    var list by remember { mutableStateOf<List<Item>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var opened by remember { mutableStateOf<Item?>(null) }

    fun load() {
        scope.launch {
            loading = true
            error = null
            try { list = withContext(Dispatchers.IO) { Api.history(user) } } catch (e: Exception) { error = "اتصال برقرار نشد" }
            loading = false
        }
    }
    LaunchedEffect(Unit) { load() }

    Column(Modifier.fillMaxSize()) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("خاطره‌های ما 🖼️", color = Cream, fontWeight = FontWeight.Bold, fontSize = 16.sp, modifier = Modifier.weight(1f))
            OutlineBtn("🔄", onClick = { load() })
        }
        when {
            loading -> Text("در حال بارگذاری…", color = Cream.copy(alpha = 0.6f), modifier = Modifier.padding(20.dp))
            error != null -> Text("❌ $error", color = Color(0xFFFF8A8A), modifier = Modifier.padding(20.dp))
            list.isEmpty() -> Text("هنوز چیزی ردوبدل نشده… اولین نقاشی رو بفرست 🎨", color = Cream.copy(alpha = 0.6f), modifier = Modifier.padding(20.dp))
            else -> LazyVerticalGrid(
                columns = GridCells.Fixed(2), contentPadding = PaddingValues(12.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                items(list) { item -> GalleryCard(item, user) { opened = item } }
            }
        }
    }

    val cur = opened
    if (cur != null) {
        Dialog(onDismissRequest = { opened = null }) {
            Glass(Modifier.fillMaxWidth()) {
                val mine = cur.sender == user
                Text(if (mine) "ارسال‌شده توسط تو" else "از طرف ${if (cur.sender == "matin") "متین" else "مطهره"} 💌", color = Orange, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(10.dp))
                if (cur.kind == "video") {
                    OutlineBtn("🎬 پخش ویدیو", Modifier.fillMaxWidth()) {
                        ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(Api.BASE + cur.url)))
                    }
                } else {
                    NetImage(cur.url, Modifier.fillMaxWidth().aspectRatio(0.8f).clip(RoundedCornerShape(16.dp)), 1200)
                }
                if (cur.caption.isNotEmpty()) Text(cur.caption, color = Color(0xFFFF9A9E), modifier = Modifier.padding(top = 10.dp))
                Row(Modifier.fillMaxWidth().padding(top = 14.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlineBtn("بستن", Modifier.weight(1f)) { opened = null }
                    if (mine) OutlineBtn("🗑️ حذف", Modifier.weight(1f)) {
                        scope.launch {
                            withContext(Dispatchers.IO) { runCatching { Api.delete(user, cur.id) } }
                            opened = null
                            load()
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun GalleryCard(item: Item, user: String, onClick: () -> Unit) {
    val mine = item.sender == user
    val label = if (mine) (if (item.seen) "دیده شد ✓✓" else "ارسال شد ✓") else "از طرف ${if (item.sender == "matin") "متین" else "مطهره"} 💌"
    Box(Modifier.fillMaxWidth().aspectRatio(0.8f).clip(RoundedCornerShape(16.dp)).background(Color(0x14FFFFFF)).clickable(onClick = onClick)) {
        if (item.kind == "video") Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("🎬", fontSize = 40.sp) }
        else NetImage(item.url, Modifier.fillMaxSize(), 500)
        Box(
            Modifier.align(Alignment.BottomCenter).fillMaxWidth()
                .background(Brush.verticalGradient(listOf(Color.Transparent, Color(0xCC000000)))).padding(8.dp),
        ) { Text(label, color = Cream, fontSize = 11.sp) }
    }
}

// ---------- تنظیمات ----------
@Composable
fun SettingsTab(onLogout: () -> Unit) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    var interval by remember { mutableIntStateOf(Prefs.interval(ctx)) }
    var includeSent by remember { mutableStateOf(Prefs.includeSent(ctx)) }
    var status by remember { mutableStateOf(Prefs.status(ctx)) }
    var syncing by remember { mutableStateOf(false) }
    val notifLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { _ -> }

    fun syncNow() {
        scope.launch {
            syncing = true
            withContext(Dispatchers.IO) { Sync.run(ctx, true) }
            status = Prefs.status(ctx)
            syncing = false
        }
    }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Glass(Modifier.fillMaxWidth()) {
            Text("وضعیت ویجت", color = Orange, fontWeight = FontWeight.Bold)
            Text(status, color = Cream.copy(alpha = 0.85f), fontSize = 13.sp, modifier = Modifier.padding(top = 6.dp))
            GradButton(if (syncing) "در حال بررسی…" else "همگام‌سازی همین الان 🔄", Modifier.fillMaxWidth().padding(top = 12.dp), !syncing) { syncNow() }
        }

        Glass(Modifier.fillMaxWidth()) {
            Text("هر چند ثانیه سرور چک بشه؟", color = Orange, fontWeight = FontWeight.Bold)
            Text("عدد کمتر = سریع‌تر ولی باتری بیشتر", color = Cream.copy(alpha = 0.6f), fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp, bottom = 10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(15, 30, 60, 120, 300).forEach { s ->
                    Box(
                        Modifier.clip(RoundedCornerShape(50)).background(if (interval == s) Orange else Color(0x1FFFFFFF))
                            .clickable { interval = s; Prefs.setInterval(ctx, s) }.padding(horizontal = 14.dp, vertical = 8.dp),
                    ) { Text("$s ث", color = if (interval == s) Color(0xFF111111) else Cream, fontSize = 13.sp) }
                }
            }
        }

        Glass(Modifier.fillMaxWidth()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("نمایش ارسال‌های خودم هم", color = Cream, fontWeight = FontWeight.Bold)
                    Text("برای تست با یک گوشی: چیزی که خودت می‌فرستی هم روی ویجتت میاد", color = Cream.copy(alpha = 0.6f), fontSize = 12.sp)
                }
                Switch(checked = includeSent, onCheckedChange = {
                    includeSent = it
                    Prefs.setIncludeSent(ctx, it)
                    syncNow()
                })
            }
        }

        Glass(Modifier.fillMaxWidth()) {
            Text("آماده‌سازی گوشی", color = Orange, fontWeight = FontWeight.Bold)
            Text("برای اینکه ویجت همیشه زنده بمونه، این سه مورد رو انجام بده:", color = Cream.copy(alpha = 0.6f), fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp, bottom = 10.dp))
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlineBtn("➕ افزودن ویجت به صفحه‌ی اصلی", Modifier.fillMaxWidth()) {
                    val mgr = AppWidgetManager.getInstance(ctx)
                    if (Build.VERSION.SDK_INT >= 26 && mgr.isRequestPinAppWidgetSupported) {
                        mgr.requestPinAppWidget(ComponentName(ctx, DoodleWidget::class.java), null, null)
                    } else {
                        Toast.makeText(ctx, "روی صفحه‌ی اصلی نگه دار ← Widgets ← Elysium", Toast.LENGTH_LONG).show()
                    }
                }
                OutlineBtn("🔔 اجازه‌ی اعلان‌ها", Modifier.fillMaxWidth()) {
                    if (Build.VERSION.SDK_INT >= 33) notifLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                    else Toast.makeText(ctx, "اعلان‌ها فعاله ✅", Toast.LENGTH_SHORT).show()
                }
                OutlineBtn("🔋 بدون محدودیت باتری", Modifier.fillMaxWidth()) {
                    try {
                        ctx.startActivity(Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:${ctx.packageName}")))
                    } catch (e: Exception) {
                        ctx.startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
                    }
                }
                OutlineBtn("🚀 شروع خودکار (شیائومی/سامسونگ…)", Modifier.fillMaxWidth()) {
                    ctx.startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${ctx.packageName}")))
                }
            }
        }

        OutlineBtn("تغییر کاربر", Modifier.fillMaxWidth(), onClick = onLogout)
        Spacer(Modifier.height(8.dp))
    }
}
