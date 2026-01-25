export type Language = "en" | "id";

export const translations = {
  en: {
    // Header
    header: {
      home: "Home",
      schedules: "Schedules",
      packages: "Packages",
      classes: "Classes",
      coaches: "Coaches",
      login: "Login",
      myAccount: "My Account",
      adminPanel: "Admin Panel",
    },

    // Hero Section
    hero: {
      tagline: "The Body Flows, The Aura Flows.",
    },

    // About Section
    about: {
      title: "About Us",
      paragraph1:
        "At Aure Pilates, we believe in the power of flow, where movement feels natural, breath guides the body, and strength is built with ease. Our studio is a space designed for connection: between body and mind, effort and release, movement and stillness.",
      paragraph2:
        "Our Pilates approach emphasizes fluid transitions, mindful control, and rhythmic breath. Each session invites you to move with awareness, allowing the body to flow freely while building balance, stability, and grace.",
      paragraph3:
        "Guided by experienced and attentive instructors, our classes are thoughtfully designed to support your unique journey, whether you are beginning your Pilates practice or refining it. We honor progress that feels sustainable, intuitive, and aligned with your body.",
      paragraph4:
        "This is more than a workout—it's a practice, a community, and a lifestyle.",
    },

    // Classes Section
    classes: {
      title: "Classes Available",
      reformer: {
        title: "Reformer",
        description:
          "Using the reformer machine, this practice adds resistance and support to enhance strength, balance, and precision. Reformer Pilates allows for highly controlled, low-impact movement that challenges the body while protecting the joints.",
      },
      spineCorrector: {
        title: "Spine Corrector",
        description:
          "Designed to improve spinal mobility, posture, and core connection. Spine-focused sessions help release tension, support alignment, and encourage healthy, pain-free movement.",
      },
      matt: {
        title: "Matt",
        description:
          "Build strength from the inside out using your own body weight. Mat Pilates focuses on core stability, flexibility, and alignment—perfect for creating a strong foundation and improving everyday movement.",
      },
      contactPrompt: "Not sure which of our class best fit your needs?",
      contactCta:
        "Contact us here, Our team will be pleased to answer any question you have!",
    },

    // Coaches Section
    coaches: {
      title: "Meet The Coaches",
    },

    // Packages Section
    packages: {
      title: "Save More With Packages",
      getPackage: "Get Package",
      credits: "credits",
      forClasses: "for",
      classesLabel: "classes",
      oneTimePayment: "One-time payment",
      validFor: "Valid for",
      days: "days",
      fromPurchase: "from purchase",
      studio: "studio",
      noPackages: "No packages available for the selected filters.",
      clearFilters: "Clear filters",
      allLocations: "All Locations",
      allClasses: "All Classes",
      contactPrompt: "Not sure which package best fits your needs?",
      contactCta:
        "Contact us here, our team will be pleased to answer any questions you have!",
    },

    // Schedule Section
    schedule: {
      title: "Scheduled Classes",
      classesFor: "Classes scheduled for",
      classesCount: "classes",
      noClasses: "No classes available for this date.",
      loading: "Loading classes...",
      bookNow: "Book Now",
      joinWaitlist: "Join Waitlist",
      classStarted: "Class Started",
      completed: "Completed",
      minsLabel: "mins",
      left: "left",
      allLocations: "All Locations",
      allClasses: "All Classes",
      allInstructors: "All Instructors",
      location: "Location",
      classes: "Classes",
      instructor: "Instructor",
      clearAll: "Clear all",
      full: "Full",
      available: "slot available",
    },

    // CTA Section
    cta: {
      title: "Start Today!",
      paragraph1:
        "We offer classes designed to meet you where you are—whether you're new to Pilates or deepening your practice. From mat work to reformer sessions, each class is thoughtfully structured to build strength, enhance flexibility, and cultivate mindful movement.",
      paragraph2:
        "Join us for group classes that foster connection and motivation, or book a private session tailored to your unique goals. Our experienced instructors are here to guide you every step of the way.",
      paragraph3: "Your journey starts now. Let's move together.",
      viewClasses: "View Classes",
      joinClass: "Join Class",
      bookPrivate: "Book Private Class",
    },

    // Locations Section
    locations: {
      title: "Our Studios",
      comingSoon: "Coming Soon",
      getDirections: "Get Directions",
      openingSoon: "Opening Soon",
    },

    // Footer
    footer: {
      contactUs: "Contact Us",
      copyright: "Copyrights © 2025 All Rights Reserved by Aure Pilates Studio",
    },

    // Floating WhatsApp Button
    whatsapp: {
      contactUs: "Contact Us",
      defaultMessage: "Hi! I'd like to inquire about Aure Pilates classes.",
      selectLocation: "Select Location",
      selectLocationDesc: "Choose which studio location you'd like to contact",
    },

    // Waitlist Modal
    waitlist: {
      title: "Join Waitlist",
      description:
        "This class is currently full. Join the waitlist and we'll notify you if a spot opens up.",
      autoBook: "Auto-book when available",
      autoBookDesc:
        "Automatically book this class using your package credit when a spot opens",
      selectPackage: "Select Package to Use",
      creditsLeft: "credits left",
      creditNote: "Your credit will only be used if a spot becomes available",
      noPackageNote:
        "You don't have a compatible package for this class. We'll notify you when a spot opens, and you can book with single payment.",
      cancel: "Cancel",
      joining: "Joining...",
      joinWaitlist: "Join Waitlist",
      loadingOptions: "Loading options...",
      successTitle: "Added to Waitlist!",
      successAutoBooked: "Booking Confirmed!",
      successMessage:
        "We'll notify you if a spot becomes available for this class.",
      successAutoBookedMessage:
        "A spot opened up and you've been automatically booked into this class!",
      done: "Done",
      alreadyOnWaitlist: "You're already on the waitlist for this class!",
      failedToJoin: "Failed to join waitlist. Please try again.",
      pleaseLogin: "Please log in to join the waitlist",
    },

    // Booking Page
    booking: {
      title: "Book Your Class",
      backToSchedule: "Back to Schedule",
      classInfo: "Class Information",
      numberOfAttendees: "Number of Attendees",
      max: "Max",
      available: "available",
      attendeeDetails: "Attendee Details",
      useMyDetails: "Use My Details",
      attendee: "Attendee",
      fullName: "Full Name",
      phoneNumber: "Phone Number",
      enterFullName: "Enter full name",
      enterPhone: "08123456789",
      paymentMethod: "Payment Method",
      usePackageCredits: "Use Package Credits",
      selectFromPackages: "Select from your available packages",
      selectPackage: "Select a package",
      expires: "Expires",
      expiringSoon: "Expiring soon!",
      singlePayment: "Single Payment",
      paymentDescription: "Pay with credit card, e-wallet, or bank transfer",
      noPackagesAvailable:
        "You don't have any active packages for this class type. Get a package to save more!",
      explorePackages: "Explore Packages",
      notEnoughCredits:
        "⚠️ Not enough credits. You need {quantity} credits but only have {remaining}. Please choose single payment or select another package.",
      bookingSummary: "Booking Summary",
      attendees: "Attendees",
      pricePerPerson: "Price per person",
      total: "Total",
      credit: "credit",
      credits: "credits",
      confirmBooking: "Confirm Booking",
      proceedToPayment: "Proceed to Payment",
      processing: "Processing...",
      creditsWillBeDeducted:
        "{quantity} {unit} will be deducted from your package",
      needMoreCredits: "You need {quantity} more {unit}",
      loading: "Loading...",
      errorSelectPackage: "Please select a package",
      errorNotEnoughCredits:
        "Not enough credits in selected package. Please choose single payment or another package.",
      errorAttendeeName: "Please enter name for attendee {number}",
      errorAttendeePhone: "Please enter phone number for attendee {number}",
      studioRules: "Studio Rules & Policies",
      readRules: "Please read and agree to our studio rules before booking",
      viewRules: "View Studio Rules",
    },

    // Account Section
    account: {
      title: "My Aure Account",
      tabs: {
        profile: "Profile",
        manageBooking: "Manage Booking",
        history: "Booking History",
        packages: "Active Packages",
      },
      profile: {
        fullName: "Full Name",
        email: "Email",
        phoneNumber: "Phone Number",
        dateOfBirth: "Date of Birth",
        address: "Address",
        editProfile: "Edit Profile",
        logOut: "Log Out",
        loading: "Loading profile...",
        userNotFound: "User not found.",
        incompleteWarning:
          "Profile Incomplete: Please complete your profile to ensure smooth booking experience.",
      },
      editProfile: {
        title: "Edit Profile",
        fullNameRequired: "Full name is required",
        fullNameTooShort: "Full name is too short",
        invalidPhone: "Invalid phone number",
        invalidDate: "Invalid date",
        dateFuture: "Date cannot be in the future",
        ageMinimum: "You must be at least 13 years old",
        ageMaximum: "Please enter a valid date of birth",
        addressTooShort: "Address must be at least 10 characters",
        saving: "Saving...",
      },
      manageBooking: {
        title: "Upcoming Classes",
        description:
          "Need to change your schedule? You can reschedule your booking up to 12 hours before the class starts.",
        noBookings: "No upcoming bookings",
        noBookingsDesc: "Your confirmed bookings will appear here",
        reschedule: "Reschedule",
        noChanges: "No Changes",
        startsIn: "Starts in",
        paymentMethod: "Payment Method",
        singlePayment: "Single Payment",
        onTime: "On Time",
        delayed: "Delayed",
        cancelled: "Cancelled",
        loading: "Loading your bookings...",
      },
      bookingHistory: {
        title: "Booking History",
        noHistory: "No booking history yet",
        noHistoryDesc:
          "Your past bookings will appear here after you attend classes",
        completed: "Completed",
        cancelled: "Cancelled",
        noShow: "No Show",
        loading: "Loading your booking history...",
      },
      activePackages: {
        title: "Active Packages",
        pastPackages: "Past Packages",
        noActivePackages: "No active packages",
        noActivePackagesDesc: "Purchase a package to start saving on classes",
        browsePackages: "Browse Packages",
        active: "Active",
        expiringSoon: "Expiring Soon",
        expired: "Expired",
        completed: "Completed",
        remaining: "Remaining",
        used: "Used",
        progress: "Progress",
        purchased: "Purchased",
        expires: "Expires",
        daysLeft: "d left",
        classesLabel: "classes",
        validityDays: "days validity",
        loading: "Loading your packages...",
      },
    },

    // Login Page
    login: {
      title: "Login",
      email: "Email",
      password: "Password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      loginButton: "Login",
      loggingIn: "Logging in…",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
      show: "Show",
      hide: "Hide",
    },

    // Signup Page
    signup: {
      title: "Sign Up",
      fullName: "Full Name",
      email: "Email",
      phoneNumber: "Phone Number",
      dateOfBirth: "Date of Birth",
      address: "Address",
      addressPlaceholder: "Full Address",
      password: "Password",
      passwordPlaceholder: "Password (min. 6 characters)",
      confirmPassword: "Confirm Password",
      retypePassword: "Retype Password",
      passwordsMatch: "Passwords match",
      passwordsNoMatch: "Passwords do not match",
      createAccount: "Create Account",
      creatingAccount: "Creating account…",
      alreadyHaveAccount: "Already have an account?",
      loginLink: "Login",
      show: "Show",
      hide: "Hide",
      errors: {
        nameTooShort: "Full name must be at least 2 characters",
        invalidEmail: "Invalid email address",
        invalidPhone: "Invalid phone number",
        invalidDate: "Invalid date",
        dateFuture: "Date cannot be in the future",
        ageMinimum: "You must be at least 13 years old",
        ageMaximum: "Please enter a valid date of birth",
        addressTooShort: "Address must be at least 10 characters",
        passwordTooShort: "Password must be at least 6 characters",
        failedToCreate: "Failed to create account",
        failedToSaveProfile: "Failed to save profile information",
        emailExists: "An account with this email already exists",
        phoneExists: "An account with this phone number already exists",
      },
    },

    // Forgot Password Page
    forgotPassword: {
      title: "Forgot Password",
      description:
        "Enter your email address and we'll send you instructions to reset your password.",
      emailPlaceholder: "Email",
      sendButton: "Send reset link",
      sending: "Sending…",
      sentMessage: "If an account exists for",
      sentMessageEnd:
        ", you'll receive an email with instructions to reset your password.",
      backToLogin: "Back to login",
    },

    // Common
    common: {
      date: "Date",
      time: "Time",
      class: "Class",
      coach: "Coach",
      price: "Price",
      capacity: "Capacity",
      status: "Status",
      back: "Back",
      save: "Save",
      cancel: "Cancel",
      confirm: "Confirm",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      location: "Location",
    },
  },

  id: {
    // Header
    header: {
      home: "Beranda",
      schedules: "Jadwal",
      packages: "Paket",
      classes: "Kelas",
      coaches: "Instruktur",
      login: "Masuk",
      myAccount: "Akun Saya",
      adminPanel: "Panel Admin",
    },

    // Hero Section
    hero: {
      tagline: "Tubuh Mengalir, Aura Mengalir.",
    },

    // About Section
    about: {
      title: "Tentang Kami",
      paragraph1:
        "Di Aure Pilates, kami percaya pada kekuatan aliran, di mana gerakan terasa alami, napas membimbing tubuh, dan kekuatan dibangun dengan mudah. Studio kami adalah ruang yang dirancang untuk koneksi: antara tubuh dan pikiran, usaha dan pelepasan, gerakan dan ketenangan.",
      paragraph2:
        "Pendekatan Pilates kami menekankan transisi yang mengalir, kontrol penuh kesadaran, dan napas yang berirama. Setiap sesi mengundang Anda untuk bergerak dengan kesadaran, memungkinkan tubuh mengalir bebas sambil membangun keseimbangan, stabilitas, dan keanggunan.",
      paragraph3:
        "Dipandu oleh instruktur yang berpengalaman dan penuh perhatian, kelas-kelas kami dirancang dengan cermat untuk mendukung perjalanan unik Anda, baik Anda baru memulai latihan Pilates atau menyempurnakannya. Kami menghargai kemajuan yang terasa berkelanjutan, intuitif, dan selaras dengan tubuh Anda.",
      paragraph4:
        "Ini lebih dari sekadar latihan—ini adalah praktik, komunitas, dan gaya hidup.",
    },

    // Classes Section
    classes: {
      title: "Kelas yang Tersedia",
      reformer: {
        title: "Reformer",
        description:
          "Menggunakan mesin reformer, latihan ini menambah resistensi dan dukungan untuk meningkatkan kekuatan, keseimbangan, dan presisi. Reformer Pilates memungkinkan gerakan terkontrol tinggi dengan dampak rendah yang menantang tubuh sambil melindungi sendi.",
      },
      spineCorrector: {
        title: "Spine Corrector",
        description:
          "Dirancang untuk meningkatkan mobilitas tulang belakang, postur, dan koneksi inti. Sesi yang berfokus pada tulang belakang membantu melepaskan ketegangan, mendukung keselarasan, dan mendorong gerakan yang sehat dan bebas rasa sakit.",
      },
      matt: {
        title: "Matt",
        description:
          "Bangun kekuatan dari dalam ke luar menggunakan berat badan Anda sendiri. Mat Pilates berfokus pada stabilitas inti, fleksibilitas, dan keselarasan—sempurna untuk menciptakan fondasi yang kuat dan meningkatkan gerakan sehari-hari.",
      },
      contactPrompt: "Tidak yakin kelas mana yang paling cocok untuk Anda?",
      contactCta:
        "Hubungi kami di sini, tim kami dengan senang hati akan menjawab pertanyaan Anda!",
    },

    // Coaches Section
    coaches: {
      title: "Kenali Para Instruktur",
    },

    // Packages Section
    packages: {
      title: "Hemat Lebih Banyak dengan Paket",
      getPackage: "Ambil Paket",
      credits: "kredit",
      forClasses: "untuk",
      classesLabel: "kelas",
      oneTimePayment: "Pembayaran satu kali",
      validFor: "Berlaku selama",
      days: "hari",
      fromPurchase: "dari pembelian",
      studio: "studio",
      noPackages: "Tidak ada paket tersedia untuk filter yang dipilih.",
      clearFilters: "Hapus filter",
      allLocations: "Semua Lokasi",
      allClasses: "Semua Kelas",
      contactPrompt: "Tidak yakin paket mana yang paling cocok untuk Anda?",
      contactCta:
        "Hubungi kami di sini, tim kami dengan senang hati akan menjawab pertanyaan Anda!",
    },

    // Schedule Section
    schedule: {
      title: "Jadwal Kelas",
      classesFor: "Kelas dijadwalkan untuk",
      classesCount: "kelas",
      noClasses: "Tidak ada kelas tersedia untuk tanggal ini.",
      loading: "Memuat kelas...",
      bookNow: "Pesan Sekarang",
      joinWaitlist: "Gabung Daftar Tunggu",
      classStarted: "Kelas Dimulai",
      completed: "Selesai",
      minsLabel: "menit",
      left: "tersisa",
      allLocations: "Semua Lokasi",
      allClasses: "Semua Kelas",
      allInstructors: "Semua Instruktur",
      location: "Lokasi",
      classes: "Kelas",
      instructor: "Instruktur",
      clearAll: "Hapus semua",
      full: "Penuh",
      available: "slot tersedia",
    },

    // CTA Section
    cta: {
      title: "Mulai Hari Ini!",
      paragraph1:
        "Kami menawarkan kelas yang dirancang untuk memenuhi kebutuhan Anda—baik Anda baru mengenal Pilates atau memperdalam latihan Anda. Dari latihan mat hingga sesi reformer, setiap kelas disusun dengan cermat untuk membangun kekuatan, meningkatkan fleksibilitas, dan mengembangkan gerakan penuh kesadaran.",
      paragraph2:
        "Bergabunglah dengan kami untuk kelas grup yang memupuk koneksi dan motivasi, atau pesan sesi privat yang disesuaikan dengan tujuan unik Anda. Instruktur berpengalaman kami siap membimbing Anda di setiap langkah.",
      paragraph3: "Perjalanan Anda dimulai sekarang. Mari bergerak bersama.",
      viewClasses: "Lihat Kelas",
      joinClass: "Gabung Kelas",
      bookPrivate: "Pesan Kelas Privat",
    },

    // Locations Section
    locations: {
      title: "Studio Kami",
      comingSoon: "Segera Hadir",
      getDirections: "Dapatkan Petunjuk Arah",
      openingSoon: "Segera Dibuka",
    },

    // Footer
    footer: {
      contactUs: "Hubungi Kami",
      copyright:
        "Hak Cipta © 2025 Seluruh Hak Dilindungi oleh Aure Pilates Studio",
    },

    // Floating WhatsApp Button
    whatsapp: {
      contactUs: "Hubungi Kami",
      defaultMessage: "Hai! Saya ingin bertanya tentang kelas Aure Pilates.",
      selectLocation: "Pilih Lokasi",
      selectLocationDesc: "Pilih lokasi studio yang ingin Anda hubungi",
    },

    // Waitlist Modal
    waitlist: {
      title: "Gabung Daftar Tunggu",
      description:
        "Kelas ini saat ini penuh. Gabung daftar tunggu dan kami akan memberitahu Anda jika ada tempat yang tersedia.",
      autoBook: "Pesan otomatis saat tersedia",
      autoBookDesc:
        "Otomatis pesan kelas ini menggunakan kredit paket Anda saat ada tempat tersedia",
      selectPackage: "Pilih Paket yang Digunakan",
      creditsLeft: "kredit tersisa",
      creditNote:
        "Kredit Anda hanya akan digunakan jika ada tempat yang tersedia",
      noPackageNote:
        "Anda tidak memiliki paket yang kompatibel untuk kelas ini. Kami akan memberitahu Anda saat ada tempat tersedia, dan Anda dapat memesan dengan pembayaran tunggal.",
      cancel: "Batal",
      joining: "Bergabung...",
      joinWaitlist: "Gabung Daftar Tunggu",
      loadingOptions: "Memuat opsi...",
      successTitle: "Ditambahkan ke Daftar Tunggu!",
      successAutoBooked: "Pemesanan Dikonfirmasi!",
      successMessage:
        "Kami akan memberitahu Anda jika ada tempat yang tersedia untuk kelas ini.",
      successAutoBookedMessage:
        "Ada tempat yang tersedia dan Anda telah otomatis dipesan ke kelas ini!",
      done: "Selesai",
      alreadyOnWaitlist: "Anda sudah ada di daftar tunggu untuk kelas ini!",
      failedToJoin: "Gagal bergabung daftar tunggu. Silakan coba lagi.",
      pleaseLogin: "Silakan masuk untuk bergabung daftar tunggu",
    },
    // Booking Page
    booking: {
      title: "Pesan Kelas Anda",
      backToSchedule: "Kembali ke Jadwal",
      classInfo: "Informasi Kelas",
      numberOfAttendees: "Jumlah Peserta",
      max: "Maks",
      available: "tersedia",
      attendeeDetails: "Detail Peserta",
      useMyDetails: "Gunakan Detail Saya",
      attendee: "Peserta",
      fullName: "Nama Lengkap",
      phoneNumber: "Nomor Telepon",
      enterFullName: "Masukkan nama lengkap",
      enterPhone: "08123456789",
      paymentMethod: "Metode Pembayaran",
      usePackageCredits: "Gunakan Kredit Paket",
      selectFromPackages: "Pilih dari paket yang tersedia",
      selectPackage: "Pilih paket",
      expires: "Kedaluwarsa",
      expiringSoon: "Segera kedaluwarsa!",
      singlePayment: "Pembayaran Tunggal",
      paymentDescription:
        "Bayar dengan kartu kredit, e-wallet, atau transfer bank",
      noPackagesAvailable:
        "Anda tidak memiliki paket aktif untuk jenis kelas ini. Dapatkan paket untuk hemat lebih banyak!",
      explorePackages: "Jelajahi Paket",
      notEnoughCredits:
        "⚠️ Kredit tidak cukup. Anda memerlukan {quantity} kredit tetapi hanya memiliki {remaining}. Silakan pilih pembayaran tunggal atau pilih paket lain.",
      bookingSummary: "Ringkasan Pemesanan",
      attendees: "Peserta",
      pricePerPerson: "Harga per orang",
      total: "Total",
      credit: "kredit",
      credits: "kredit",
      confirmBooking: "Konfirmasi Pemesanan",
      proceedToPayment: "Lanjutkan ke Pembayaran",
      processing: "Memproses...",
      creditsWillBeDeducted: "{quantity} {unit} akan dikurangi dari paket Anda",
      needMoreCredits: "Anda memerlukan {quantity} {unit} lagi",
      loading: "Memuat...",
      errorSelectPackage: "Silakan pilih paket",
      errorNotEnoughCredits:
        "Kredit tidak cukup dalam paket yang dipilih. Silakan pilih pembayaran tunggal atau paket lain.",
      errorAttendeeName: "Silakan masukkan nama untuk peserta {number}",
      errorAttendeePhone:
        "Silakan masukkan nomor telepon untuk peserta {number}",
      studioRules: "Peraturan & Kebijakan Studio",
      readRules: "Harap baca dan setujui peraturan studio kami sebelum memesan",
      viewRules: "Lihat Peraturan Studio",
    },

    // Account Section
    account: {
      title: "Akun Aure Saya",
      tabs: {
        profile: "Profil",
        manageBooking: "Kelola Pemesanan",
        history: "Riwayat Pemesanan",
        packages: "Paket Aktif",
      },
      profile: {
        fullName: "Nama Lengkap",
        email: "Email",
        phoneNumber: "Nomor Telepon",
        dateOfBirth: "Tanggal Lahir",
        address: "Alamat",
        editProfile: "Edit Profil",
        logOut: "Keluar",
        loading: "Memuat profil...",
        userNotFound: "Pengguna tidak ditemukan.",
        incompleteWarning:
          "Profil Belum Lengkap: Harap lengkapi profil Anda untuk memastikan pengalaman pemesanan yang lancar.",
      },
      editProfile: {
        title: "Edit Profil",
        fullNameRequired: "Nama lengkap wajib diisi",
        fullNameTooShort: "Nama lengkap terlalu pendek",
        invalidPhone: "Nomor telepon tidak valid",
        invalidDate: "Tanggal tidak valid",
        dateFuture: "Tanggal tidak boleh di masa depan",
        ageMinimum: "Anda harus berusia minimal 13 tahun",
        ageMaximum: "Harap masukkan tanggal lahir yang valid",
        addressTooShort: "Alamat harus minimal 10 karakter",
        saving: "Menyimpan...",
      },
      manageBooking: {
        title: "Kelas Mendatang",
        description:
          "Perlu mengubah jadwal? Anda dapat menjadwal ulang pemesanan hingga 12 jam sebelum kelas dimulai.",
        noBookings: "Tidak ada pemesanan mendatang",
        noBookingsDesc: "Pemesanan yang dikonfirmasi akan muncul di sini",
        reschedule: "Jadwal Ulang",
        noChanges: "Tidak Bisa Diubah",
        startsIn: "Dimulai dalam",
        paymentMethod: "Metode Pembayaran",
        singlePayment: "Pembayaran Tunggal",
        onTime: "Tepat Waktu",
        delayed: "Tertunda",
        cancelled: "Dibatalkan",
        loading: "Memuat pemesanan Anda...",
      },
      bookingHistory: {
        title: "Riwayat Pemesanan",
        noHistory: "Belum ada riwayat pemesanan",
        noHistoryDesc:
          "Pemesanan sebelumnya akan muncul di sini setelah Anda menghadiri kelas",
        completed: "Selesai",
        cancelled: "Dibatalkan",
        noShow: "Tidak Hadir",
        loading: "Memuat riwayat pemesanan Anda...",
      },
      activePackages: {
        title: "Paket Aktif",
        pastPackages: "Paket Sebelumnya",
        noActivePackages: "Tidak ada paket aktif",
        noActivePackagesDesc: "Beli paket untuk mulai menghemat biaya kelas",
        browsePackages: "Lihat Paket",
        active: "Aktif",
        expiringSoon: "Segera Kedaluwarsa",
        expired: "Kedaluwarsa",
        completed: "Selesai",
        remaining: "Tersisa",
        used: "Terpakai",
        progress: "Progres",
        purchased: "Dibeli",
        expires: "Kedaluwarsa",
        daysLeft: "h tersisa",
        classesLabel: "kelas",
        validityDays: "hari berlaku",
        loading: "Memuat paket Anda...",
      },
    },

    // Login Page
    login: {
      title: "Masuk",
      email: "Email",
      password: "Kata Sandi",
      rememberMe: "Ingat saya",
      forgotPassword: "Lupa kata sandi?",
      loginButton: "Masuk",
      loggingIn: "Sedang masuk…",
      noAccount: "Belum punya akun?",
      signUp: "Daftar",
      show: "Tampilkan",
      hide: "Sembunyikan",
    },

    // Signup Page
    signup: {
      title: "Daftar",
      fullName: "Nama Lengkap",
      email: "Email",
      phoneNumber: "Nomor Telepon",
      dateOfBirth: "Tanggal Lahir",
      address: "Alamat",
      addressPlaceholder: "Alamat Lengkap",
      password: "Kata Sandi",
      passwordPlaceholder: "Kata Sandi (min. 6 karakter)",
      confirmPassword: "Konfirmasi Kata Sandi",
      retypePassword: "Ketik Ulang Kata Sandi",
      passwordsMatch: "Kata sandi cocok",
      passwordsNoMatch: "Kata sandi tidak cocok",
      createAccount: "Buat Akun",
      creatingAccount: "Membuat akun…",
      alreadyHaveAccount: "Sudah punya akun?",
      loginLink: "Masuk",
      show: "Tampilkan",
      hide: "Sembunyikan",
      errors: {
        nameTooShort: "Nama lengkap harus minimal 2 karakter",
        invalidEmail: "Alamat email tidak valid",
        invalidPhone: "Nomor telepon tidak valid",
        invalidDate: "Tanggal tidak valid",
        dateFuture: "Tanggal tidak boleh di masa depan",
        ageMinimum: "Anda harus berusia minimal 13 tahun",
        ageMaximum: "Harap masukkan tanggal lahir yang valid",
        addressTooShort: "Alamat harus minimal 10 karakter",
        passwordTooShort: "Kata sandi harus minimal 6 karakter",
        failedToCreate: "Gagal membuat akun",
        failedToSaveProfile: "Gagal menyimpan informasi profil",
        emailExists: "Akun dengan email ini sudah ada",
        phoneExists: "Akun dengan nomor telepon ini sudah ada",
      },
    },

    // Forgot Password Page
    forgotPassword: {
      title: "Lupa Kata Sandi",
      description:
        "Masukkan alamat email Anda dan kami akan mengirimkan instruksi untuk mengatur ulang kata sandi.",
      emailPlaceholder: "Email",
      sendButton: "Kirim tautan reset",
      sending: "Mengirim…",
      sentMessage: "Jika akun terdaftar untuk",
      sentMessageEnd:
        ", Anda akan menerima email dengan instruksi untuk mengatur ulang kata sandi.",
      backToLogin: "Kembali ke login",
    },

    // Common
    common: {
      date: "Tanggal",
      time: "Waktu",
      class: "Kelas",
      coach: "Instruktur",
      price: "Harga",
      capacity: "Kapasitas",
      status: "Status",
      back: "Kembali",
      save: "Simpan",
      cancel: "Batal",
      confirm: "Konfirmasi",
      loading: "Memuat...",
      error: "Kesalahan",
      success: "Berhasil",
      location: "Lokasi",
    },
  },
};

// Type for the translation structure
export type TranslationKeys = {
  header: {
    home: string;
    schedules: string;
    packages: string;
    classes: string;
    coaches: string;
    login: string;
    myAccount: string;
    adminPanel: string;
  };
  hero: {
    tagline: string;
  };
  about: {
    title: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    paragraph4: string;
  };
  classes: {
    title: string;
    reformer: {
      title: string;
      description: string;
    };
    spineCorrector: {
      title: string;
      description: string;
    };
    matt: {
      title: string;
      description: string;
    };
    contactPrompt: string;
    contactCta: string;
  };
  coaches: {
    title: string;
  };
  packages: {
    title: string;
    getPackage: string;
    credits: string;
    forClasses: string;
    classesLabel: string;
    oneTimePayment: string;
    validFor: string;
    days: string;
    fromPurchase: string;
    studio: string;
    noPackages: string;
    clearFilters: string;
    allLocations: string;
    allClasses: string;
    contactPrompt: string;
    contactCta: string;
  };
  schedule: {
    title: string;
    classesFor: string;
    classesCount: string;
    noClasses: string;
    loading: string;
    bookNow: string;
    joinWaitlist: string;
    classStarted: string;
    completed: string;
    minsLabel: string;
    left: string;
    allLocations: string;
    allClasses: string;
    allInstructors: string;
    location: string;
    classes: string;
    instructor: string;
    clearAll: string;
    full: string;
    available: string;
  };
  cta: {
    title: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    viewClasses: string;
    joinClass: string;
    bookPrivate: string;
  };
  locations: {
    title: string;
    comingSoon: string;
    getDirections: string;
    openingSoon: string;
  };
  footer: {
    contactUs: string;
    copyright: string;
  };
  whatsapp: {
    contactUs: string;
    defaultMessage: string;
    selectLocation: string;
    selectLocationDesc: string;
  };
  waitlist: {
    title: string;
    description: string;
    autoBook: string;
    autoBookDesc: string;
    selectPackage: string;
    creditsLeft: string;
    creditNote: string;
    noPackageNote: string;
    cancel: string;
    joining: string;
    joinWaitlist: string;
    loadingOptions: string;
    successTitle: string;
    successAutoBooked: string;
    successMessage: string;
    successAutoBookedMessage: string;
    done: string;
    alreadyOnWaitlist: string;
    failedToJoin: string;
    pleaseLogin: string;
  };
  booking: {
    title: string;
    backToSchedule: string;
    classInfo: string;
    numberOfAttendees: string;
    max: string;
    available: string;
    attendeeDetails: string;
    useMyDetails: string;
    attendee: string;
    fullName: string;
    phoneNumber: string;
    enterFullName: string;
    enterPhone: string;
    paymentMethod: string;
    usePackageCredits: string;
    selectFromPackages: string;
    selectPackage: string;
    expires: string;
    expiringSoon: string;
    singlePayment: string;
    paymentDescription: string;
    noPackagesAvailable: string;
    explorePackages: string;
    notEnoughCredits: string;
    bookingSummary: string;
    attendees: string;
    pricePerPerson: string;
    total: string;
    credit: string;
    credits: string;
    confirmBooking: string;
    proceedToPayment: string;
    processing: string;
    creditsWillBeDeducted: string;
    needMoreCredits: string;
    loading: string;
    errorSelectPackage: string;
    errorNotEnoughCredits: string;
    errorAttendeeName: string;
    errorAttendeePhone: string;
    studioRules: string;
    readRules: string;
    viewRules: string;
  };
  account: {
    title: string;
    tabs: {
      profile: string;
      manageBooking: string;
      history: string;
      packages: string;
    };
    profile: {
      fullName: string;
      email: string;
      phoneNumber: string;
      dateOfBirth: string;
      address: string;
      editProfile: string;
      logOut: string;
      loading: string;
      userNotFound: string;
      incompleteWarning: string;
    };
    editProfile: {
      title: string;
      fullNameRequired: string;
      fullNameTooShort: string;
      invalidPhone: string;
      invalidDate: string;
      dateFuture: string;
      ageMinimum: string;
      ageMaximum: string;
      addressTooShort: string;
      saving: string;
    };
    manageBooking: {
      title: string;
      description: string;
      noBookings: string;
      noBookingsDesc: string;
      reschedule: string;
      noChanges: string;
      startsIn: string;
      paymentMethod: string;
      singlePayment: string;
      onTime: string;
      delayed: string;
      cancelled: string;
      loading: string;
    };
    bookingHistory: {
      title: string;
      noHistory: string;
      noHistoryDesc: string;
      completed: string;
      cancelled: string;
      noShow: string;
      loading: string;
    };
    activePackages: {
      title: string;
      pastPackages: string;
      noActivePackages: string;
      noActivePackagesDesc: string;
      browsePackages: string;
      active: string;
      expiringSoon: string;
      expired: string;
      completed: string;
      remaining: string;
      used: string;
      progress: string;
      purchased: string;
      expires: string;
      daysLeft: string;
      classesLabel: string;
      validityDays: string;
      loading: string;
    };
  };
  login: {
    title: string;
    email: string;
    password: string;
    rememberMe: string;
    forgotPassword: string;
    loginButton: string;
    loggingIn: string;
    noAccount: string;
    signUp: string;
    show: string;
    hide: string;
  };
  signup: {
    title: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    address: string;
    addressPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    confirmPassword: string;
    retypePassword: string;
    passwordsMatch: string;
    passwordsNoMatch: string;
    createAccount: string;
    creatingAccount: string;
    alreadyHaveAccount: string;
    loginLink: string;
    show: string;
    hide: string;
    errors: {
      nameTooShort: string;
      invalidEmail: string;
      invalidPhone: string;
      invalidDate: string;
      dateFuture: string;
      ageMinimum: string;
      ageMaximum: string;
      addressTooShort: string;
      passwordTooShort: string;
      failedToCreate: string;
      failedToSaveProfile: string;
      emailExists: string;
      phoneExists: string;
    };
  };
  forgotPassword: {
    title: string;
    description: string;
    emailPlaceholder: string;
    sendButton: string;
    sending: string;
    sentMessage: string;
    sentMessageEnd: string;
    backToLogin: string;
  };
  common: {
    date: string;
    time: string;
    class: string;
    coach: string;
    price: string;
    capacity: string;
    status: string;
    back: string;
    save: string;
    cancel: string;
    confirm: string;
    loading: string;
    error: string;
    success: string;
    location: string;
  };
};
