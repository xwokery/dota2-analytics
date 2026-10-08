const OPENDOTA_BASE = "https://api.opendota.com/api";

// 1. Получение списка недавних про-матчей
export const fetchRecentProMatches = async () => {
  try {
    const res = await fetch(`${OPENDOTA_BASE}/proMatches`);
    const data = await res.json();
    return data.slice(0, 10).map((match) => ({
      id: match.match_id.toString(),
      radiantTeam: match.radiant_name || "Radiant",
      direTeam: match.dire_name || "Dire",
      radiantWin: match.radiant_win,
      duration: `${Math.floor(match.duration / 60)}:${(match.duration % 60)
        .toString()
        .padStart(2, "0")}`,
      league: match.league_name || "Professional Match",
      radiantScore: match.radiant_score,
      direScore: match.dire_score,
      timeAgo: `${Math.floor((Date.now() / 1000 - match.start_time) / 3600)}h ago`,
    }));
  } catch (err) {
    console.error("Failed to fetch pro matches:", err);
    return [];
  }
};

// 2. Получение детализированной статистики матча по Match ID
export const fetchMatchDetails = async (matchId) => {
  try {
    const res = await fetch(`${OPENDOTA_BASE}/matches/${matchId}`);
    const data = await res.json();
    
    return {
      id: data.match_id.toString(),
      radiantWin: data.radiant_win,
      duration: `${Math.floor(data.duration / 60)}:${(data.duration % 60)
        .toString()
        .padStart(2, "0")}`,
      radiantScore: data.radiant_score,
      direScore: data.dire_score,
      // Детальная таблица игроков
      players: data.players.map((p) => ({
        id: p.player_id || p.hero_id,
        name: p.personaname || `Player ${p.player_slot + 1}`,
        hero: p.hero_id, // В реальном проекте сопоставляется с именами героев
        role: p.pred_vict ? "Core" : "Support",
        kda: `${p.kills}/${p.deaths}/${p.assists}`,
        gpm: p.gold_per_min,
        xpm: p.xp_per_min,
        lh: p.last_hits,
        heroDamage: `${(p.hero_damage / 1000).toFixed(1)}k`,
        netWorth: `${(p.net_worth / 1000).toFixed(1)}k`,
        team: p.player_slot < 128 ? "radiant" : "dire",
      })),
      // График преимущества по золоту/опыту
      chartData: (data.radiant_gold_adv || []).map((gold, index) => ({
        minute: `${index}m`,
        goldAdv: gold,
        xpAdv: data.radiant_xp_adv ? data.radiant_xp_adv[index] : 0,
      })),
    };
  } catch (err) {
    console.error("Failed to fetch match details:", err);
    return null;
  }
};

// 3. Получение мета-статистики героеев (Винрейты / Пикрейты из High MMR)
export const fetchHeroStats = async () => {
  try {
    const res = await fetch(`${OPENDOTA_BASE}/heroStats`);
    const data = await res.json();
    return data.map((h) => ({
      id: h.id,
      name: h.localized_name,
      img: `https://cdn.cloudflare.steamstatic.com${h.img}`,
      icon: `https://cdn.cloudflare.steamstatic.com${h.icon}`,
      attr: h.pro_pick ? h.primary_attr : "str",
      proWinrate: ((h.pro_win / (h.pro_pick || 1)) * 100).toFixed(1),
      proPicks: h.pro_pick || 0,
      proBans: h.pro_ban || 0,
    }));
  } catch (err) {
    console.error("Failed to fetch hero stats:", err);
    return [];
  }
};