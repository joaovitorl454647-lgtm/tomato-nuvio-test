const TOMATO_API = "https://beta-api.tomatoanimes.com";

function getJson(response) {
  return response.text().then(function (text) {
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error("Resposta não é JSON");
    }
  });
}

function asArray(data) {
  if (Array.isArray(data)) return data;

  if (!data || typeof data !== "object") {
    return [];
  }

  var keys = [
    "data",
    "results",
    "animes",
    "anime",
    "items",
    "seasons",
    "episodes"
  ];

  for (var i = 0; i < keys.length; i++) {
    if (Array.isArray(data[keys[i]])) {
      return data[keys[i]];
    }
  }

  return [];
}

function findAnimeId(data) {
  var list = asArray(data);

  for (var i = 0; i < list.length; i++) {
    var item = list[i];

    if (!item || typeof item !== "object") continue;

    var title = String(
      item.title ||
      item.name ||
      item.anime_name ||
      item.animeTitle ||
      ""
    ).toLowerCase();

    if (title.indexOf("black clover") !== -1) {
      return item.id ||
        item.anime_id ||
        item.animeId ||
        item.animeID ||
        item.season_id ||
        null;
    }
  }

  return null;
}

function getStreams(tmdbId, mediaType, season, episode) {
  console.log("[Tomato Test] iniciado");
  console.log("[Tomato Test] TMDB:", tmdbId);
  console.log("[Tomato Test] tipo:", mediaType);
  console.log("[Tomato Test] temporada:", season);
  console.log("[Tomato Test] episódio:", episode);

  /*
   * Black Clover no TMDB = 73223
   *
   * Este teste SOMENTE consulta a busca do Tomato
   * para verificar se conseguimos identificar o anime.
   *
   * NÃO acessa o endpoint de vídeo/stream.
   */

  if (String(tmdbId) !== "73223") {
    console.log("[Tomato Test] título fora do teste");
    return Promise.resolve([]);
  }

  var url =
    TOMATO_API +
    "/animequery/?q=" +
    encodeURIComponent("Black Clover");

  console.log("[Tomato Test] consultando:", url);

  return fetch(url)
    .then(function (response) {
      console.log(
        "[Tomato Test] HTTP:",
        response.status
      );

      return getJson(response);
    })
    .then(function (data) {
      var tomatoId = findAnimeId(data);

      console.log(
        "[Tomato Test] ID encontrado:",
        tomatoId
      );

      if (!tomatoId) {
        console.log(
          "[Tomato Test] Black Clover não identificado"
        );
      } else {
        console.log(
          "[Tomato Test] Black Clover identificado no Tomato!"
        );
      }

      /*
       * Importante:
       * não retornamos nenhum vídeo.
       * Este provider é somente diagnóstico.
       */
      return [];
    })
    .catch(function (error) {
      console.log(
        "[Tomato Test] erro:",
        String(error)
      );

      return [];
    });
}

module.exports = {
  getStreams: getStreams
};
