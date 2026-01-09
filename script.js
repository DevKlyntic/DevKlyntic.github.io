(() => {
  const Doc = document.documentElement;
  const Body = document.body;

  const ThemeToggle = document.querySelector(".ThemeToggle");
  const ThemeMeta = document.querySelector('meta[name="theme-color"]');
  const ThemeKey = "DevKlynticTheme";

  const NavToggle = document.querySelector(".NavToggle");
  const Mobile = document.querySelector(".Mobile");
  const MobileShade = document.querySelector(".MobileShade");
  const MobileClose = document.querySelector(".MobileClose");

  const ToTop = document.querySelector(".ToTop");
  const NavLinks = Array.from(document.querySelectorAll(".NavLink"));
  const MobileLinks = Array.from(document.querySelectorAll(".MobileLink"));

  const RotateNode = document.querySelector(".SubDynamic");

  const SetTheme = (Theme) => {
    const Next = Theme === "light" ? "light" : "dark";
    Doc.setAttribute("data-theme", Next);
    if (ThemeMeta) ThemeMeta.setAttribute("content", Next === "light" ? "#f7f8fb" : "#0b0d14");
    if (ThemeToggle) ThemeToggle.setAttribute("aria-pressed", Next === "light" ? "true" : "false");
    try { localStorage.setItem(ThemeKey, Next); } catch (_) {}
  };

  const InitTheme = () => {
    let Saved = null;
    try { Saved = localStorage.getItem(ThemeKey); } catch (_) {}
    if (Saved === "light" || Saved === "dark") {
      SetTheme(Saved);
      return;
    }
    SetTheme("dark");
  };

  const ToggleTheme = () => {
    const Current = Doc.getAttribute("data-theme") || "dark";
    SetTheme(Current === "dark" ? "light" : "dark");
  };

  const OpenMobile = () => {
    if (!Mobile) return;
    Mobile.classList.add("Open");
    if (NavToggle) NavToggle.setAttribute("aria-expanded", "true");

    const FocusTarget = Mobile.querySelector(".MobileLink") || MobileClose;
    if (FocusTarget) setTimeout(() => FocusTarget.focus(), 0);
  };

  const CloseMobile = () => {
    if (!Mobile) return;
    Mobile.classList.remove("Open");
    if (NavToggle) NavToggle.setAttribute("aria-expanded", "false");
  };

  const IsMobileOpen = () => Mobile && Mobile.classList.contains("Open");

  const ScrollToHash = (Hash) => {
    if (!Hash || Hash.length < 2) return;
    const Target = document.querySelector(Hash);
    if (!Target) return;

    const Header = document.querySelector(".Header");
    const Offset = Header ? Header.getBoundingClientRect().height + 10 : 86;
    const Y = window.scrollY + Target.getBoundingClientRect().top - Offset;

    window.scrollTo({ top: Math.max(0, Y), behavior: "smooth" });
  };

  const WireAnchors = () => {
    const Anchors = Array.from(document.querySelectorAll('a[href^="#"]'));
    Anchors.forEach((A) => {
      A.addEventListener("click", (E) => {
        const Href = A.getAttribute("href") || "";
        if (Href === "#") return;

        const IsSamePage = Href.startsWith("#");
        if (!IsSamePage) return;

        const Target = document.querySelector(Href);
        if (!Target) return;

        E.preventDefault();
        if (IsMobileOpen()) CloseMobile();
        history.pushState(null, "", Href);
        ScrollToHash(Href);
      }, { passive: false });
    });

    if (location.hash) {
      const StartHash = location.hash;
      setTimeout(() => ScrollToHash(StartHash), 30);
    }
  };

  const InitReveal = () => {
    const Nodes = Array.from(document.querySelectorAll(".Reveal"));
    if (!Nodes.length) return;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      Nodes.forEach((N) => N.classList.add("Visible"));
      return;
    }

    const Io = new IntersectionObserver((Entries) => {
      Entries.forEach((Entry) => {
        if (!Entry.isIntersecting) return;
        Entry.target.classList.add("Visible");
        Io.unobserve(Entry.target);
      });
    }, { root: null, threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    Nodes.forEach((N) => Io.observe(N));
  };

  const InitActiveNav = () => {
    const Sections = [
      document.querySelector("#About"),
      document.querySelector("#Skills"),
      document.querySelector("#Work"),
      document.querySelector("#Pricing"),
      document.querySelector("#Contact"),
    ].filter(Boolean);

    if (!Sections.length || !NavLinks.length) return;

    const Map = new Map();
    NavLinks.forEach((L) => {
      const H = L.getAttribute("href");
      if (H && H.startsWith("#")) Map.set(H.slice(1), L);
    });

    const Clear = () => NavLinks.forEach((L) => L.classList.remove("Active"));

    const Io = new IntersectionObserver((Entries) => {
      const Visible = Entries
        .filter((E) => E.isIntersecting)
        .sort((A, B) => (B.intersectionRatio || 0) - (A.intersectionRatio || 0));

      if (!Visible.length) return;
      const Id = Visible[0].target.id;
      const Link = Map.get(Id);
      if (!Link) return;
      Clear();
      Link.classList.add("Active");
    }, { threshold: [0.2, 0.35, 0.5], rootMargin: "-20% 0px -60% 0px" });

    Sections.forEach((S) => Io.observe(S));
  };

  const InitToTop = () => {
    if (!ToTop) return;

    const Tick = () => {
      const Show = window.scrollY > 600;
      ToTop.classList.toggle("Show", Show);
    };

    window.addEventListener("scroll", Tick, { passive: true });
    Tick();

    ToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const InitRotate = () => {
    if (!RotateNode) return;

    const Raw = RotateNode.getAttribute("data-rotate") || "";
    const Items = Raw.split(",").map((S) => S.trim()).filter(Boolean);
    if (Items.length < 2) return;

    let Index = 0;
    let Busy = false;

    const Fade = (Next) => {
      if (Busy) return;
      Busy = true;

      RotateNode.animate(
        [{ opacity: 1, transform: "translateY(0px)" }, { opacity: 0, transform: "translateY(-6px)" }],
        { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
      ).onfinish = () => {
        RotateNode.textContent = Next;
        RotateNode.animate(
          [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0px)" }],
          { duration: 260, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" }
        ).onfinish = () => { Busy = false; };
      };
    };

    const Loop = () => {
      Index = (Index + 1) % Items.length;
      Fade(Items[Index]);
    };

    setInterval(Loop, 2600);
  };

  const WireMobile = () => {
    if (NavToggle) {
      NavToggle.addEventListener("click", () => {
        if (IsMobileOpen()) CloseMobile();
        else OpenMobile();
      });
    }

    if (MobileShade) MobileShade.addEventListener("click", CloseMobile);
    if (MobileClose) MobileClose.addEventListener("click", CloseMobile);

    MobileLinks.forEach((L) => {
      L.addEventListener("click", () => {
        CloseMobile();
      });
    });

    window.addEventListener("keydown", (E) => {
      if (E.key === "Escape" && IsMobileOpen()) CloseMobile();
    });
  };

  const Boot = () => {
    if (!Doc.getAttribute("data-theme")) Doc.setAttribute("data-theme", "dark");
    InitTheme();

    if (ThemeToggle) ThemeToggle.addEventListener("click", ToggleTheme);

    WireMobile();
    WireAnchors();
    InitReveal();
    InitActiveNav();
    InitToTop();
    InitRotate();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", Boot);
  } else {
    Boot();
  }
})()
