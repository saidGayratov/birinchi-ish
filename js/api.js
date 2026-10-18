(function () {
  var API_BASE = "",
    GOOGLE_CLIENT_ID = "",
    K = "bi_user";

  function req(p, b) {
    return fetch(API_BASE + p, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b)
    })
      .then(function (r) {
        return r.json()
          .catch(function () {
            return {};
          })
          .then(function (j) {
            if (!r.ok) throw new Error(j.message || "Error");
            return j;
          });
      });
  }

  function demo(u) {
    return new Promise(function (ok) {
      setTimeout(function () {
        ok(u);
      }, 500);
    });
  }

  window.API = {
    login: function (d) {
      return API_BASE ? req("/auth/login", d) : demo({ name: "", email: d.email });
    },

    signup: function (d) {
      return API_BASE ? req("/auth/register", d) : demo({ name: d.name, email: d.email });
    },

    google: function () {
      return new Promise(function (ok, no) {
        if (!GOOGLE_CLIENT_ID) return ok({ name: "Google User", email: "user@gmail.com" });

        function go() {
          google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: function (r) {
              req("/auth/google", { credential: r.credential }).then(ok, no);
            }
          });
          google.accounts.id.prompt();
        }

        if (window.google && google.accounts) return go();
        var s = document.createElement("script");
        s.src = "https://accounts.google.com/gsi/client";
        s.onload = go;
        s.onerror = function () {
          no(new Error("Google"));
        };
        document.head.appendChild(s);
      });
    },

    logout: function () {
      try {
        localStorage.removeItem(K);
      } catch (e) {}
      return API_BASE ? req("/auth/logout", {}).catch(function () {}) : Promise.resolve();
    },

    getUser: function () {
      try {
        return JSON.parse(localStorage.getItem(K));
      } catch (e) {
        return null;
      }
    },

    setUser: function (u) {
      try {
        localStorage.setItem(K, JSON.stringify(u));
      } catch (e) {}
    }
  };
})();