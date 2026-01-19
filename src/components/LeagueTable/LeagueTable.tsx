import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import styles from './LeagueTable.module.scss';

// Generate mock teams for each group
const generateTeams = (groupName: string, count: number) => {
  const teamNames: Record<string, string[]> = {
    Men: ['Thunder FC', 'Lightning United', 'Phoenix Squad', 'Storm FC', 'Titans United', 'Warriors FC', 'Dragons United', 'Eagles FC'],
    Women: ['Victory FC', 'Diamond United', 'Phoenix FC', 'Thunder Squad', 'Lightning FC', 'Galaxy United', 'Stars FC', 'Comets United'],
    Coed: ['Unity FC', 'Fusion United', 'Harmony FC', 'Balance Squad', 'Synergy United', 'Alliance FC', 'Blend United', 'Together FC'],
    'Over 40': ['Veterans FC', 'Legends United', 'Classic FC', 'Vintage Squad', 'Experience United', 'Wisdom FC', 'Elite Squad', 'Prime FC'],
    'Over 50': ['Golden FC', 'Masters United', 'Senior Squad', 'Platinum FC', 'Legacy United', 'Diamond FC', 'Silver Squad', 'Grand FC']
  };

  return teamNames[groupName].slice(0, count).map((name, idx) => ({
    id: `${groupName.toLowerCase().replace(/\s+/g, '-')}-${idx}`,
    name,
    mp: Math.floor(Math.random() * 4) + 6,
    w: 0,
    l: 0,
    t: 0,
    p: 0,
    gf: 0,
    ga: 0
  })).map(team => {
    team.w = Math.floor(Math.random() * (team.mp * 0.6));
    team.l = Math.floor(Math.random() * (team.mp - team.w));
    team.t = team.mp - team.w - team.l;
    team.p = (team.w * 3) + team.t;
    team.gf = Math.floor(Math.random() * 20) + team.w * 2;
    team.ga = Math.floor(Math.random() * 15) + team.l * 2;
    return team;
  }).sort((a, b) => b.p - a.p);
};

const generateSchedule = (teamName: string, groupTeams: any[], mp: number) => {
  const matches = [];
  const otherTeams = groupTeams.filter(t => t.name !== teamName);
  
  for (let i = 0; i < mp; i++) {
    const opponent = otherTeams[i % otherTeams.length];
    const isHome = Math.random() > 0.5;
    const teamScore = Math.floor(Math.random() * 5);
    const opponentScore = Math.floor(Math.random() * 5);
    
    const weeksAgo = Math.floor(Math.random() * 12);
    const matchDate = new Date();
    matchDate.setDate(matchDate.getDate() - (weeksAgo * 7));
    
    matches.push({
      date: matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      opponent: opponent.name,
      isHome,
      teamScore,
      opponentScore,
      result: teamScore > opponentScore ? 'W' : teamScore < opponentScore ? 'L' : 'T'
    });
  }
  
  return matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const leagueData = {
  Men: generateTeams('Men', 8),
  Women: generateTeams('Women', 8),
  Coed: generateTeams('Coed', 8),
  'Over 40': generateTeams('Over 40', 8),
  'Over 50': generateTeams('Over 50', 8)
};

interface Team {
  id: string;
  name: string;
  mp: number;
  w: number;
  l: number;
  t: number;
  p: number;
  gf: number;
  ga: number;
  schedule?: any[];
}

const LeagueTable: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<string>('Men');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleTeamClick = (team: Team) => {
    const schedule = generateSchedule(
      team.name,
      leagueData[selectedGroup as keyof typeof leagueData],
      team.mp
    );
    setSelectedTeam({ ...team, schedule });
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>League Standings</h1>
          <p className={styles.subtitle}>
            View team standings and match schedules across all leagues
          </p>
        </div>
        
        {/* League Group Tabs */}
        <div className={styles.tabs}>
          {Object.keys(leagueData).map(group => (
            <button
              key={group}
              onClick={() => {
                setSelectedGroup(group);
                setSelectedTeam(null);
              }}
              className={`${styles.tab} ${selectedGroup === group ? styles.tabActive : ''}`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className={styles.layout}>
          {/* Standings Table */}
          <div className={styles.standingsContainer}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th className={styles.colRank}>#</th>
                  <th className={styles.colTeam}>Team</th>
                  <th className={styles.colStat}>MP</th>
                  <th className={styles.colStat}>W</th>
                  <th className={styles.colStat}>D</th>
                  <th className={styles.colStat}>L</th>
                  <th className={styles.colStat}>GF</th>
                  <th className={styles.colStat}>GA</th>
                  <th className={styles.colStat}>+/-</th>
                  <th className={styles.colPoints}>PTS</th>
                </tr>
              </thead>
              <tbody>
                {leagueData[selectedGroup as keyof typeof leagueData].map((team, index) => {
                  const goalDiff = team.gf - team.ga;
                  
                  return (
                    <tr
                      key={team.id}
                      onClick={() => handleTeamClick(team)}
                      className={`${styles.tableRow} ${index % 2 === 0 ? styles.rowEven : styles.rowOdd} ${
                        selectedTeam?.id === team.id ? styles.rowSelected : ''
                      }`}
                    >
                      <td className={styles.colRank}>{index + 1}</td>
                      <td className={styles.colTeam}>
                        <span className={styles.teamName}>{team.name}</span>
                      </td>
                      <td className={styles.colStat}>{team.mp}</td>
                      <td className={styles.colStat}>{team.w}</td>
                      <td className={styles.colStat}>{team.t}</td>
                      <td className={styles.colStat}>{team.l}</td>
                      <td className={styles.colStat}>{team.gf}</td>
                      <td className={styles.colStat}>{team.ga}</td>
                      <td className={styles.colStat}>
                        {goalDiff > 0 ? '+' : ''}{goalDiff}
                      </td>
                      <td className={styles.colPoints}>{team.p}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Team Schedule */}
          {selectedTeam ? (
            <div className={styles.scheduleContainer}>
              <div className={styles.scheduleHeader}>
                <div>
                  <h2 className={styles.scheduleTitle}>{selectedTeam.name}</h2>
                  <p className={styles.scheduleRecord}>
                    Record: {selectedTeam.w}-{selectedTeam.t}-{selectedTeam.l} • <span className={styles.schedulePoints}>{selectedTeam.p} pts</span>
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedTeam(null)}
                  className={styles.closeButton}
                >
                  <X className={styles.closeIcon} />
                </button>
              </div>

              <div className={styles.scheduleLabel}>
                <Calendar className={styles.calendarIcon} />
                Match Schedule
              </div>

              <div className={styles.scheduleList}>
                {selectedTeam.schedule?.map((match, idx) => (
                  <div
                    key={idx}
                    className={`${styles.matchItem} ${idx % 2 === 0 ? styles.matchEven : styles.matchOdd}`}
                  >
                    <div className={styles.matchInfo}>
                      <div className={styles.matchDate}>{match.date}</div>
                      <div className={styles.matchTeams}>
                        {match.isHome ? selectedTeam.name : match.opponent} vs {match.isHome ? match.opponent : selectedTeam.name}
                      </div>
                    </div>
                    <div className={styles.matchResult}>
                      <div className={styles.matchScore}>
                        {match.teamScore} - {match.opponentScore}
                      </div>
                      <div className={styles.matchOutcome}>
                        {match.result === 'W' ? 'Win' : match.result === 'L' ? 'Loss' : 'Draw'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyContent}>
                <div className={styles.emptyIcon}>
                  <Calendar className={styles.calendarIconLarge} />
                </div>
                <p className={styles.emptyTitle}>No Team Selected</p>
                <p className={styles.emptySubtitle}>Click any team from the standings to view their schedule</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeagueTable;