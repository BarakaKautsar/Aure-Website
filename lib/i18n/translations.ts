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
    },
  },
};

// Type for the translation structure (uses string instead of literal types)
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
  };
};
