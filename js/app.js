(function () {
  var $ = function (s, r) {
      return (r || document).querySelector(s);
    },
    $$ = function (s, r) {
      return [].slice.call((r || document).querySelectorAll(s));
    };
  var T = I18N,
    L = "uz",
    mode = "login";
  try {
    L = localStorage.getItem("lang") || "uz";
  } catch (e) {}

  function t(k) {
    return (T[L] && T[L][k]) || T.uz[k] || k;
  }

  function setLang(l) {
    L = l;
    try {
      localStorage.setItem("lang", l);
    } catch (e) {}
    document.documentElement.lang = l;
    $("#lang").value = l;
    $$("[data-i18n]").forEach(function (e) {
      e.textContent = t(e.dataset.i18n);
    });
    $$("[data-i18n-ph]").forEach(function (e) {
      e.placeholder = t(e.dataset.i18nPh);
    });
    drawJobs();
    tab(mode);
    uiUser();
  }
  $("#lang").onchange = function () {
    setLang(this.value);
  };

  function modal(open, m) {
    $("#modal").hidden = !open;
    document.body.classList.toggle("lock", open);
    if (open) {
      tab(m || "login");
      $("#fe").focus();
    }
  }

  function tab(m) {
    mode = m;
    $$(".tabs button").forEach(function (b) {
      b.classList.toggle("on", b.dataset.tab === m);
    });
    $("#fn").hidden = m !== "signup";
    $("#sub").textContent = t(m);
    $("#fp").autocomplete = m === "login" ? "current-password" : "new-password";
    $("#err").textContent = "";
  }
  $$("[data-auth]").forEach(function (b) {
    b.onclick = function () {
      $("#nav").classList.remove("open");
      modal(true, b.dataset.auth);
    };
  });
  $$(".tabs button").forEach(function (b) {
    b.onclick = function () {
      tab(b.dataset.tab);
    };
  });
  $("#mx").onclick = function () {
    modal(false);
  };
  $("#modal").onclick = function (e) {
    if (e.target === this) modal(false);
  };
  addEventListener("keydown", function (e) {
    if (e.key === "Escape") modal(false);
  });

  function done(u) {
    API.setUser(u);
    modal(false);
    uiUser();
  }

  function fail(x) {
    $("#err").textContent = x.message;
  }
  $("#af").onsubmit = function (e) {
    e.preventDefault();
    var n = $("#fn").value.trim(),
      m = $("#fe").value.trim(),
      p = $("#fp").value;
    var er = mode === "signup" && !n ? "a_e3" : !/^\S+@\S+\.\S+$/.test(m) ? "a_e1" : p.length < 8 ? "a_e2" : "";
    if (er) {
      $("#err").textContent = t(er);
      return;
    }
    $("#sub").disabled = true;
    API[mode]({ name: n, email: m, password: p })
      .then(done)
      .catch(fail)
      .then(function () {
        $("#sub").disabled = false;
      });
  };
  $("#gbtn").onclick = function () {
    API.google().then(done).catch(fail);
  };

  function uiUser() {
    var u = API.getUser();
    $("#guest").hidden = !!u;
    $("#user").hidden = !u;
    if (u) $("#uname").textContent = t("a_hi") + ", " + (u.name || u.email.split("@")[0]);
  }
  $("#out").onclick = function () {
    API.logout().then(uiUser);
  };

  var SK = ["Python", "JavaScript", "Design", "Marketing", "English", "Data"],
    sel = {},
    JB = [
      ["Junior Web Developer", "IT · Tashkent", ["JavaScript", "Python"]],
      ["UI/UX Intern", "Studio · Remote", ["Design"]],
      ["Data Analyst Intern", "Fintech · Tashkent", ["Data", "Python"]],
      ["SMM Assistant", "Agency · Samarkand", ["Marketing", "Design"]],
      ["Customer Success", "Global Co. · Remote", ["English", "Marketing"]],
      ["Backend Intern", "Startup · Navoi", ["Python", "Data"]]
    ];
  SK.forEach(function (s) {
    var b = document.createElement("button");
    b.className = "chip";
    b.textContent = s;
    b.onclick = function () {
      sel[s] = !sel[s];
      b.classList.toggle("on");
      drawJobs();
    };
    $("#chips").appendChild(b);
  });

  function drawJobs() {
    var k = SK.filter(function (s) {
        return sel[s];
      }),
      o = $("#jobs");
    o.innerHTML = "";
    if (!k.length) {
      o.innerHTML = "<p class=mu>" + t("demo_empty") + "</p>";
      return;
    }
    var r = JB.map(function (j) {
      return {
        j: j,
        p: Math.round(
          j[2].filter(function (x) {
            return k.indexOf(x) > -1;
          }).length / j[2].length * 100
        )
      };
    })
      .filter(function (x) {
        return x.p;
      })
      .sort(function (a, b) {
        return b.p - a.p;
      });
    if (!r.length) {
      o.innerHTML = "<p class=mu>" + t("demo_none") + "</p>";
      return;
    }
    r.forEach(function (x, i) {
      var d = document.createElement("div");
      d.className = "job";
      d.style.animationDelay = i * 70 + "ms";
      d.innerHTML = "<div><h4></h4><small></small><div class=bar><i></i></div></div><div class=m>" + x.p + "%<small>" + t("match") + "</small></div>";
      $("h4", d).textContent = x.j[0];
      $("small", d).textContent = x.j[1];
      $("i", d).style.width = x.p + "%";
      o.appendChild(d);
    });
  }

  function count(el) {
    var b = $("[data-n]", el);
    if (!b) return;
    var n = +b.dataset.n,
      s = b.dataset.s || "+",
      st = performance.now();
    (function f(now) {
      var p = Math.min((now - st) / 1600, 1);
      b.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))).toLocaleString("en") + s;
      if (p < 1) requestAnimationFrame(f);
    })(st);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        count(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: .15 });
  $$(".rv").forEach(function (e) {
    io.observe(e);
  });
  var nav = $("#nav"),
    pg = $("#prog"),
    bl = $$(".blob"),
    fc = $$(".fc"),
    tk = false;
  addEventListener("scroll", function () {
    if (tk) return;
    tk = true;
    requestAnimationFrame(function () {
      var y = scrollY,
        h = document.documentElement.scrollHeight - innerHeight;
      pg.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
      nav.classList.toggle("sc", y > 30);
      bl.forEach(function (b, i) {
        b.style.translate = "0 " + y * (i ? -.15 : .2) + "px";
      });
      fc.forEach(function (c, i) {
        c.style.translate = "0 " + y * -.06 * (i + 1) + "px";
      });
      tk = false;
    });
  }, { passive: true });

  $("#burger").onclick = function () {
    nav.classList.toggle("open");
  };
  $$("#menu a").forEach(function (a) {
    a.onclick = function () {
      nav.classList.remove("open");
    };
  });

  setLang(L);
})();