const TOMATO_API = "https://beta-api.tomatoanimes.com";

function json(response) {
  return response.text().then(text => {
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error("Resposta não é JSON");
    }
  });
}

function arrayOf(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  for (const key of [
    "data",
    "results",
    "animes",
    "anime",
    "items",
    "seasons",
    "episodes"
  ]) {
    if (Array.isArray(data[key])) return data[key];
  }

  return [];
}

function value(obj, names) {
  if (!obj) return null;

  for (const name of names) {
    if (obj[name] !== undefined && obj[name] !== null) {
      return obj[name];
    }
  }

  return null;
}

function getAnimeId(anime) {
  return value(anime, [
    "id",
    "anime_id",
    "animeId",
    "animeID"
  ]);
}

function getEpisodeId(ep) {
  return value(ep, [
    "ep_id",
    "episode_id",
    "episodeId",
    "episodeID"
  ]);
}

function getEpisodeNumber(ep) {
  return value(ep, [
    "ep_number",
    "episode",
    "episode_number",
    "number",
    "epNumber"
  ]);
}

async function searchTomato(title) {
  const url =
    TOMATO_API +
    "/animequery/?name=" +
    encodeURIComponent(title);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Busca Tomato HTTP " + response.status);
  }

  return json(response);
}

async function getEpisodes(seasonId) {
  const url =
    TOMATO_API +
    "/season/" +
    encodeURIComponent(String(seasonId)) +
    "/episodes";

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Episódios HTTP " + response.status);
  }

  return json(response);
}

async function getStreams(tmdbId, mediaType, season, episode) {
  console.log("[Tomato Test] Iniciando teste");

  if (mediaType !== "tv") {
    console.log("[Tomato Test] Não é uma série");
    return [];
  }

  /*
   * Primeiro teste: Black Clover.
   */
  if (String(tmdbId) !== "73223") {
    console.log("[Tomato Test] Anime não configurado neste teste");
    return [];
  }

  console.log("[Tomato Test] Anime: Black Clover");
  console.log("[Tomato Test] Temporada: " + season);
  console.log("[Tomato Test] Episódio: " + episode);

  try {
    const search = await searchTomato("Black Clover");
    const animes = arrayOf(search);

    console.log(
      "[Tomato Test] Resultados encontrados: " +
      animes.length
    );

    const anime =
      animes.find(a => {
        const name = String(
          value(a, [
            "name",
            "title",
            "anime_name",
            "animeName"
          ]) || ""
        ).toLowerCase();

        return name === "black clover";
      }) || animes[0];

    if (!anime) {
      console.log("[Tomato Test] Black Clover não encontrado");
      return [];
    }

    const animeId = getAnimeId(anime);

    console.log(
      "[Tomato Test] ID Tomato: " +
      animeId
    );

    console.log(
      "[Tomato Test] Resultado: " +
      JSON.stringify(anime)
    );

    /*
     * Algumas versões da API retornam temporadas
     * diretamente no resultado.
     */
    const seasons = arrayOf(anime);

    if (!seasons.length) {
      console.log(
        "[Tomato Test] Temporadas não encontradas nesta resposta"
      );
      return [];
    }

    let selectedSeason = seasons.find(s => {
      const number = Number(
        value(s, [
          "season",
          "season_number",
          "number",
          "seasonNumber"
        ])
      );

      return number === Number(season);
    });

    if (!selectedSeason) {
      selectedSeason = seasons[0];
    }

    const seasonId = value(selectedSeason, [
      "id",
      "season_id",
      "seasonId",
      "seasonID"
    ]);

    console.log(
      "[Tomato Test] Season ID: " +
      seasonId
    );

    if (!seasonId) {
      console.log(
        "[Tomato Test] Season ID não encontrado"
      );
      return [];
    }

    const episodeData =
      await getEpisodes(seasonId);

    const episodes =
      arrayOf(episodeData);

    console.log(
      "[Tomato Test] Episódios encontrados: " +
      episodes.length
    );

    const found = episodes.find(ep =>
      Number(getEpisodeNumber(ep)) ===
      Number(episode)
    );

    if (found) {
      console.log(
        "[Tomato Test] EPISÓDIO ENCONTRADO!"
      );

      console.log(
        "[Tomato Test] ID: " +
        getEpisodeId(found)
      );

      console.log(
        "[Tomato Test] Dados: " +
        JSON.stringify(found)
      );
    } else {
      console.log(
        "[Tomato Test] Episódio não encontrado"
      );
    }

  } catch (error) {
    console.log(
      "[Tomato Test] ERRO: " +
      error.message
    );
  }

  /*
   * TESTE SOMENTE DE IDENTIFICAÇÃO.
   * Nenhum stream é consultado ou retornado.
   */
  return [];
}

module.exports = {
  getStreams
};
