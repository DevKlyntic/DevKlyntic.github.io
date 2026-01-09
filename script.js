(function () {
  var Root = document.documentElement
  var ThemeKey = "DevKlynticTheme"
  var Body = document.body

  function GetPreferredTheme() {
    try {
      var Stored = localStorage.getItem(ThemeKey)
      if (Stored === "light" || Stored === "dark") {
        return Stored
      }
    } catch (e) {}

    if (window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
    }

    return "dark"
  }

  function SetTheme(Theme) {
    Root.setAttribute("data-theme", Theme)
    try {
      localStorage.setItem(ThemeKey, Theme)
    } catch (e) {}

    var Toggle = document.getElementById("ThemeToggle")
    if (Toggle) {
      Toggle.setAttribute("aria-pressed", Theme === "light" ? "true" : "false")
      Toggle.querySelector(".ThemeText").textContent = Theme === "light" ? "Light" : "Dark"
    }
  }

  function ToggleTheme() {
    var Current = Root.getAttribute("data-theme") || "dark"
    var Next = Current === "dark" ? "light" : "dark"
    SetTheme(Next)
  }

  function SmoothScrollToHash(Hash) {
    var Id = Hash.replace("#", "")
    var Target = document.getElementById(Id)
    if (!Target) {
      return
    }

    var Header = document.querySelector(".Header")
    var Offset = Header ? Header.getBoundingClientRect().height : 0
    var Top = Target.getBoundingClientRect().top + window.scrollY - (Offset + 14)

    window.scrollTo({
      top: Top,
      behavior: "smooth"
    })
  }

  function SetupSmoothAnchors() {
    var Links = document.querySelectorAll("a[href^='#']")
    for (var i = 0; i < Links.length; i++) {
      Links[i].addEventListener("click", function (e) {
        var Href = this.getAttribute("href")
        if (!Href || Href === "#") {
          return
        }
        e.preventDefault()
        SmoothScrollToHash(Href)
        history.pushState(null, "", Href)
        CloseMenu()
      })
    }
  }

  function RevealOnScroll() {
    var Items = document.querySelectorAll(".Reveal")
    if (!Items.length) {
      return
    }

    var Observer = new IntersectionObserver(
      function (Entries) {
        for (var i = 0; i < Entries.length; i++) {
          if (Entries[i].isIntersecting) {
            Entries[i].target.classList.add("On")
            Observer.unobserve(Entries[i].target)
          }
        }
      },
      { threshold: 0.12 }
    )

    for (var j = 0; j < Items.length; j++) {
      Observer.observe(Items[j])
    }
  }

  function SetupToTop() {
    var Btn = document.getElementById("ToTop")
    if (!Btn) {
      return
    }

    function Update() {
      if (window.scrollY > 800) {
        Btn.classList.add("Show")
      } else {
        Btn.classList.remove("Show")
      }
    }

    window.addEventListener("scroll", Update, { passive: true })
    Update()

    Btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" })
    })
  }

  function MenuOpen() {
    Body.classList.add("MenuOpen")
  }

  function CloseMenu() {
    Body.classList.remove("MenuOpen")
  }

  function SetupMobileMenu() {
    var OpenBtn = document.getElementById("NavToggle")
    var CloseBtn = document.getElementById("MobileClose")
    var Shade = document.getElementById("MobileShade")

    if (OpenBtn) {
      OpenBtn.addEventListener("click", function () {
        if (Body.classList.contains("MenuOpen")) {
          CloseMenu()
        } else {
          MenuOpen()
        }
      })
    }

    if (CloseBtn) {
      CloseBtn.addEventListener("click", function () {
        CloseMenu()
      })
    }

    if (Shade) {
      Shade.addEventListener("click", function () {
        CloseMenu()
      })
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        CloseMenu()
      }
    })
  }

  function SetupActiveSection() {
    var Links = document.querySelectorAll(".NavLink")
    var Sections = document.querySelectorAll("main .Section")
    if (!Links.length || !Sections.length) {
      return
    }

    var Map = {}
    for (var i = 0; i < Links.length; i++) {
      var H = Links[i].getAttribute("href")
      if (H && H.startsWith("#")) {
        Map[H] = Links[i]
      }
    }

    var Obs = new IntersectionObserver(
      function (Entries) {
        for (var k = 0; k < Entries.length; k++) {
          if (!Entries[k].isIntersecting) {
            continue
          }
          var Id = Entries[k].target.getAttribute("id")
          var Key = "#" + Id
          for (var j = 0; j < Links.length; j++) {
            Links[j].classList.remove("Active")
          }
          if (Map[Key]) {
            Map[Key].classList.add("Active")
          }
        }
      },
      { threshold: 0.35 }
    )

    for (var s = 0; s < Sections.length; s++) {
      Obs.observe(Sections[s])
    }
  }

  function SetupHeroRoleRotation() {
    var El = document.getElementById("RoleSwap")
    if (!El) {
      return
    }

    var Roles = [
      "Premium Roblox Scripting Engineer",
      "Luau Systems Architect",
      "Performance-First Gameplay Engineer",
      "Security-Focused Backend Builder"
    ]

    var Index = 0

    function Swap() {
      Index = (Index + 1) % Roles.length
      El.style.opacity = "0"
      El.style.transform = "translateY(4px)"
      setTimeout(function () {
        El.textContent = Roles[Index]
        El.style.opacity = "1"
        El.style.transform = "translateY(0px)"
      }, 180)
    }

    El.style.transition = "opacity 220ms ease, transform 220ms ease"
    setInterval(Swap, 3600)
  }

  function Init() {
    SetTheme(GetPreferredTheme())

    var Toggle = document.getElementById("ThemeToggle")
    if (Toggle) {
      Toggle.addEventListener("click", function () {
        ToggleTheme()
      })
    }

    SetupSmoothAnchors()
    RevealOnScroll()
    SetupToTop()
    SetupMobileMenu()
    SetupActiveSection()
    SetupHeroRoleRotation()

    if (location.hash) {
      setTimeout(function () {
        SmoothScrollToHash(location.hash)
      }, 50)
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", Init)
  } else {
    Init()
  }
})();
