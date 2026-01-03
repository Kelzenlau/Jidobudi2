
export const DEFAULT_GAME_CONFIG = {
  winScore: 1000,
  timeLimit: 60,
  voucherProbability: 100,
  theme: 'default' as const
};

export type MediaType = "image" | "video";

export const DEFAULT_HOME_CONFIG = {
  title: "Snack Match & Arcade",
  subtitle:
    "Choose your game, earn high scores, and win real vouchers from our virtual vending machine!",
  mediaType: "video" as const,
  mediaUrl: "https://vidaworld.com.my/wp-content/uploads/2025/01/VIDA-Zero_16x9_.mp4",
};


// Updated initial product set based on user request
export const INITIAL_PRODUCTS = [
  { 
    id: 'milo-kotak', 
    name: "Milo Kotak", 
    price: "2.50", 
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBqjR5LtUmW224lM_O0du3PDQWb4MCbsyLvQ&s" 
  },
  { 
    id: 'roti-7days', 
    name: "Roti 7 Days", 
    price: "2.50", 
    image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS9J6spHLq728dighvC-m_FnFvAkp5pJPntSdNSEnUXacl2TbXaY-wUfQ66dJ1UkS4xMqTN_YNl8XaKB2YJBQS0Y4_T2KUFSb0629lh8e7zhyz48nq1rwM_F1tSnlyIz0RxEBfLfLApIw&usqp=CAc" 
  },
  { 
    id: 'maggi-kari', 
    name: "Maggi Hot Cup Kari", 
    price: "3.00", 
    image: "https://www.maggi.my/sites/default/files/styles/product_image_tab_landscape_384_768/public/product_images/F22.png?itok=CTNu2-q2" 
  },
  { 
    id: 'maggi-ayam', 
    name: "Maggi Hot Cup Ayam", 
    price: "3.00", 
    image: "https://klec.jayagrocer.com/cdn/shop/files/002365-U-1-1.jpg?v=1757412101" 
  },
  { 
    id: 'air-mineral', 
    name: "Air Mineral", 
    price: "1.00", 
    image: "https://miizu.my/image/digitalgrocer/image/cache/data/all_product_images/product-204/3%20new-1080x1080.png" 
  },
  { 
    id: 'sarsi', 
    name: "Sarsi", 
    price: "2.50", 
    image: "https://jgut.jayagrocer.com/cdn/shop/products/008789-1-1_fe6127cd-8ef8-4f95-84c4-f127c19eb78c.jpg?v=1676372791" 
  }
];

export const DEFAULT_ANNOUNCEMENT = {
  text: "",
  active: false,
  color: "bg-blue-600"
};

export const DEFAULT_ADS_CONFIG = {
  active: true,
  type: 'image' as const,
  url: 'https://www.nuvendingtech.com/wp-content/uploads/2025/07/MMAP-scaled.png',
  link: ''
};


export const THEME_SETS: Record<string, string[]> = {
  default: ['🥔', '🍫', '🥤', '🍬', '🍪', '🧃'],
  fruits: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉'],
  sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊']
};

export const TRANSLATIONS: any = {
  en: {
    nav_home: "Home", nav_products: "Products", nav_game: "Game", nav_leaderboard: "Leaderboard",
    nav_about: "About", nav_profile: "Profile", nav_login: "Login", nav_signup: "Sign Up", nav_logout: "Logout",
    nav_admin: "Admin Console", play_now: "Play Now", score: "Score", timer: "Timer", start_game: "Start Game",
    score_win: "Score to Win!", login_btn: "Login", signup_btn: "Sign Up",
    admin_dashboard: "Dashboard", admin_users: "Users", admin_vouchers: "Vouchers", admin_products: "Products", admin_content: "Content", admin_settings: "Settings", admin_marketing: "Marketing",
    total_users: "Total Users", total_vouchers: "Vouchers Issued", system_status: "System Status", active: "Active",
    login_welcome: "Welcome to Jido Budi", login_subtitle: "Your gateway to fun games and tasty rewards!",
    enter_username: "Username", enter_email: "Email", enter_password: "Password", processing: "Processing...",
    error_user_exists: "User already exists. Please login.", error_user_not_found: "User not found. Please sign up first.",
    error_wrong_password: "Invalid password.",
    you_won: "YOU WON!", you_scored: "You scored", times_up: "Time's Up!", play_again: "Play Again",
    choose_game: "Choose Your Game", game_match: "Snack Match", game_match_desc: "Classic match-3 puzzle. Swap snacks to clear levels and earn points.",
    game_swipe: "Snack Swipe", game_swipe_desc: "Action arcade. Slide the cart to catch falling snacks before time runs out!",
    top_snackers: "Top Snackers", compete_spot: "Compete for the top spot!", weekly: "All Time", about_title: "About Jido Budi",
    about_desc: "Revolutionizing snacking.", mission_title: "Our Mission", mission_desc: "To bring joy to every snack break.",
    visit_us: "Visit Us", footer_rights: "All rights reserved", mobile_friendly: "Mobile-friendly experience.",
    hello: "Hello", sent_to: "Sent to", login_claim: "Login to claim", sending: "Sending...", email_voucher: "Email Voucher",
    retry: "Retry", resend: "Resend", voucher_code: "Code", chat_header: "Chat with Jido", chat_placeholder: "Ask Jido...",
    chat_online: "Online", chat_intro: "Hello! I'm Jido Budi! 🤖🍫", restocked: "Restocked Daily", whats_inside: "What's Inside?",
    grab_snacks: "Grab your favorite snacks.", select: "Select", member_since: "Member Since", last_login: "Last Login",
    account_type: "Account Type", loading_data: "Loading...", data_source: "Data retrieved from Firebase",
    my_vouchers: "My Vouchers", no_vouchers: "No vouchers yet.", voucher_won: "Won on", game_played: "Game",
    loading_leaderboard: "Loading...", no_scores: "No scores yet.", hero_title: "Snack Match & Arcade", hero_subtitle: "Choose your game, earn high scores, and win real vouchers from our virtual vending machine!",
    redeem_code: "Redeem Code", redeem_btn: "Redeem", invalid_code: "Invalid or expired code", code_success: "Code redeemed!",
    featured_product: "Featured Product", profile_title: "My Profile", profile_desc: "Manage your account and view your rewards."
  },
  ms: {
    nav_home: "Utama", nav_products: "Produk", nav_game: "Permainan", nav_leaderboard: "Papan Pendahulu",
    nav_about: "Tentang", nav_profile: "Profil", nav_admin: "Konsol", nav_login: "Log Masuk", nav_signup: "Daftar",
    nav_logout: "Log Keluar", hero_title: "Padan Snek & Arked", hero_subtitle: "Pilih permainan anda, dapatkan markah tinggi!",
    play_now: "Main Sekarang", admin_dashboard: "Papan Pemuka Admin", admin_users: "Pengguna", admin_vouchers: "Baucar",
    admin_products: "Produk", admin_content: "Kandungan", admin_settings: "Tetapan", total_users: "Jumlah Pengguna",
    total_vouchers: "Baucar Dikeluarkan", system_status: "Status Sistem", active: "Aktif",
    login_welcome: "Selamat Datang ke Jido Budi", login_subtitle: "Gerbang anda ke permainan menyeronokkan!",
    login_btn: "Log Masuk", signup_btn: "Daftar", enter_username: "Nama Pengguna", enter_email: "Emel",
    enter_password: "Kata Laluan", processing: "Memproses...", error_user_exists: "Pengguna sudah wujud.",
    error_user_not_found: "Pengguna tidak dijumpai.", error_wrong_password: "Kata laluan salah.",
    score: "Markah", timer: "Masa", start_game: "Mula", score_win: "Dapat 1000 markah untuk menang!",
    you_won: "ANDA MENANG!", you_scored: "Markah anda", times_up: "Masa Tamat!", play_again: "Main Lagi",
    choose_game: "Pilih Permainan", game_match: "Padan Snek", game_match_desc: "Teka-teki padan-3 klasik.",
    game_swipe: "Leret Snek", game_swipe_desc: "Arked aksi.", top_snackers: "Pemain Terhebat",
    compete_spot: "Bersaing untuk tempat teratas!", weekly: "Sepanjang Masa", about_title: "Tentang Jido Budi",
    about_desc: "Merevolusikan pengalaman snek.", mission_title: "Misi Kami", mission_desc: "Membawa kegembiraan dalam setiap rehat snek.",
    visit_us: "Lawati Kami", footer_rights: "Hak cipta terpelihara", mobile_friendly: "Pengalaman mesra mudah alih.",
    hello: "Helo", sent_to: "Dihantar ke", login_claim: "Log masuk untuk tuntut", sending: "Menghantar...",
    email_voucher: "Emel Baucar", retry: "Cuba Lagi", resend: "Hantar Semula", voucher_code: "Kod",
    chat_header: "Borak dengan Jido", chat_placeholder: "Tanya Jido...", chat_online: "Dalam Talian",
    chat_intro: "Helo! Saya Jido Budi! 🤖🍫", restocked: "Stok Semula Harian", whats_inside: "Apa di Dalam?",
    grab_snacks: "Dapatkan snek kegemaran anda.", select: "Pilih", member_since: "Ahli Sejak",
    last_login: "Log Masuk Terakhir", account_type: "Jenis Akaun", loading_data: "Memuatkan...",
    data_source: "Data dari Firebase", my_vouchers: "Dompet Baucar Saya", no_vouchers: "Belum ada baucar. Main permainan untuk menang!",
    voucher_won: "Dimenangi pada", game_played: "Permainan", loading_leaderboard: "Memuatkan markah...",
    no_scores: "Tiada markah lagi. Jadilah yang pertama!", profile_title: "Profil Saya", profile_desc: "Urus akaun anda dan lihat ganjaran anda."
  },
  zh: {
    nav_home: "主页", nav_products: "产品", nav_game: "游戏", nav_leaderboard: "排行榜", nav_about: "关于",
    nav_profile: "个人资料", nav_admin: "控制台", nav_login: "登录", nav_signup: "注册", nav_logout: "登出",
    hero_title: "零食消消乐 & 街机", hero_subtitle: "选择游戏，赢取高分和代金券！", play_now: "立即游玩",
    admin_dashboard: "仪表盘", admin_users: "用户", admin_vouchers: "代金券", admin_products: "产品",
    admin_content: "内容", admin_settings: "设置", total_users: "总用户数", total_vouchers: "已发代金券",
    system_status: "系统状态", active: "运行中", login_welcome: "欢迎来到 Jido Budi",
    login_subtitle: "通往有趣游戏和美味奖励的大门！", login_btn: "登录", signup_btn: "注册",
    enter_username: "用户名", enter_email: "电子邮件", enter_password: "密码", processing: "处理中...",
    error_user_exists: "用户已存在，请直接登录。", error_user_not_found: "用户不存在，请先注册。",
    error_wrong_password: "密码错误。", score: "分数", timer: "时间", start_game: "开始游戏",
    score_win: "60秒内获得1000分即可获胜！", you_won: "你赢了！", you_scored: "你的得分",
    times_up: "时间到！", play_again: "再玩一次", choose_game: "选择游戏", game_match: "零食消消乐",
    game_match_desc: "经典消消乐益智游戏。", game_swipe: "零食接接乐", game_swipe_desc: "动作街机游戏。",
    top_snackers: "零食达人", compete_spot: "争夺榜首！", weekly: "历史最佳", about_title: "关于 Jido Budi",
    about_desc: "彻底改变零食体验。", mission_title: "我们的使命", mission_desc: "为每一次零食休息带来欢乐。",
    visit_us: "拜访我们", footer_rights: "版权所有", mobile_friendly: "适合移动设备的高分辨率互动游戏体验。",
    hello: "你好",
    sent_to: "已发送至", login_claim: "登录领取", sending: "发送中...", email_voucher: "发送代金券",
    retry: "重试", resend: "重发", voucher_code: "代码", chat_header: "与 Jido 聊天",
    chat_placeholder: "问问 Jido...", chat_online: "在线", chat_intro: "你好！我是 Jido Budi！🤖🍫",
    restocked: "每日补货", whats_inside: "里面有什么？", grab_snacks: "挑选你最喜欢的零食。",
    select: "选择", member_since: "注册时间", last_login: "上次登录", account_type: "账户类型",
    loading_data: "加载中...", data_source: "数据来自 Firebase", my_vouchers: "我的代金券",
    no_vouchers: "暂无代金券。", voucher_won: "赢取于", game_played: "游戏",
    loading_leaderboard: "加载中...", no_scores: "暂无分数。", profile_title: "我的资料", profile_desc: "管理您的账户并查看奖励。"
  }
};
