var TOMATO_API = "https://beta-api.tomatoanimes.com";

function parseJson(response) {
  return response.text().then(function (text) {
    return JSON.parse(text);
  });
}

function arrayFrom(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  var keys = ["data", "results", "animes", "anime", "items", "seasons", "episodes"];

  for (var i = 0; i < keys.length; i++) {
    if (Array.isArray(data[keys[i]])) {
      return data[keys[i]];
    }
  }

  return [];
}

function getId(item) {
  if (!item || typeof item !== "object") return null;

  return item.id ||
    item.anime_id ||
    item.animeId ||
    item.season_id ||
    item.seasonId ||
    null;
}

function findBlackClover(data) {
  var list = arrayFrom(data);

  for (var i = 0; i < list.length; i++) {
    var item = list[i];

    var title = String(
      item.title ||
      item.name ||
      item.anime_name ||
      item.animeTitle ||
      ""
    ).toLowerCase();

    if (title.indexOf("black clover") !== -1) {
      return item;
    }
  }

  return null;
}

function findEpisode171(data) {
  var list = arrayFrom(data);

  for (var i = 0; i < list.length; i++) {
    var ep = list[i];

    if (!ep || typeof ep !== "object") continue;

    var number = Number(
      ep.ep_number ||
      ep.episode_number ||
      ep.episodeNumber ||
      ep.number
    );

    if (number === 171) {
      return ep;
    }
  }

  return null;
}

function getStreams(tmdbId, mediaType, season, episode) {
  console.log("[Tomato Test] ===== TESTE EPISODIO 171 =====");
  console.log("[Tomato Test] TMDB:", tmdbId);

  if (String(tmdbId) !== "73223") {
    console.log("[Tomato Test] Não é Black Clover.");
    return Promise.resolve([]);
  }

  var searchUrl =
    TOMATO_API +
    "/animequery/?q=" +
    encodeURIComponent("Black Clover");

  console.log("[Tomato Test] Buscando Black Clover...");

  return fetch(searchUrl)
    .then(function (response) {
      console.log("[Tomato Test] Busca HTTP:", response.status);
      return parseJson(response);
    })
    .then(function (data) {
      var anime = findBlackClover(data);

      if (!anime) {
        console.log("[Tomato Test] Black Clover NÃO encontrado.");
        return null;
      }

      var animeId = getId(anime);

      console.log("[Tomato Test] Anime encontrado.");
      console.log("[Tomato Test] Anime ID:", animeId);

      return anime;
    })
    .then(function (anime) {
      if (!anime) return null;

      var seasonId =
        anime.season_id ||
        anime.seasonId ||
        anime.id;

      if (!seasonId) {
        console.log("[Tomato Test] ID da temporada não encontrado.");
        return null;
      }

      var episodesUrl =
        TOMATO_API +
        "/season/" +
        encodeURIComponent(seasonId) +
        "/episodes";

      console.log(
        "[Tomato Test] Procurando episódio 171..."
      );

      return fetch(episodesUrl)
        .then(function (response) {
          console.log(
            "[Tomato Test] Episódios HTTP:",
            response.status
          );

          return parseJson(response);
        })
        .then(function (data) {
          var ep171 = findEpisode171(data);

          if (!ep171) {
            console.log(
              "[Tomato Test] EPISÓDIO 171 NÃO ENCONTRADO."
            );
            return null;
          }

          console.log(
            "[Tomato Test] ===== EPISÓDIO 171 ENCONTRADO ====="
          );

          console.log(
            "[Tomato Test] ep_id:",
            ep171.ep_id || ep171.id
          );

          console.log(
            "[Tomato Test] nome:",
            ep171.ep_name || ep171.name
          );

          console.log(
            "[Tomato Test] número:",
            ep171.ep_number
          );

          console.log(
            "[Tomato Test] duração:",
            ep171.ep_lenght_minutes
          );

          return ep171;
        });
    })
    .catch(function (error) {
      console.log(
        "[Tomato Test] ERRO:",
        String(error)
      );

      return null;
    })
    .then(function () {
      /*
       * TESTE SOMENTE DE IDENTIFICAÇÃO.
       * Não acessa o endpoint de stream.
       */
      return [];
    });
}

module.exports = {
  getStreams: getStreams
};
