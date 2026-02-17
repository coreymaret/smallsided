import React, { useState } from 'react';
import { Calendar, X, ChevronDown } from '../../components/Icons/Icons';
import styles from './LeagueTable.module.scss';

// Generate mock teams for each group
const generateTeams = (groupName: string, count: number) => {
  const teamNames: Record<string, string[]> = {
    // Adult teams
    Men: ['Thunder FC', 'Lightning United', 'Phoenix Squad', 'Storm FC', 'Titans United', 'Warriors FC', 'Dragons United', 'Eagles FC'],
    Women: ['Victory FC', 'Diamond United', 'Phoenix FC', 'Thunder Squad', 'Lightning FC', 'Galaxy United', 'Stars FC', 'Comets United'],
    Coed: ['Unity FC', 'Fusion United', 'Harmony FC', 'Balance Squad', 'Synergy United', 'Alliance FC', 'Blend United', 'Together FC'],
    'Over 40': ['Veterans FC', 'Legends United', 'Classic FC', 'Vintage Squad', 'Experience United', 'Wisdom FC', 'Elite Squad', 'Prime FC'],
    'Over 50': ['Golden FC', 'Masters United', 'Senior Squad', 'Platinum FC', 'Legacy United', 'Diamond FC', 'Silver Squad', 'Grand FC'],
    // Youth teams - Male
    'Male U8': ['Mini Thunder', 'Little Lightning', 'Junior Phoenix', 'Young Storm', 'Tiny Titans', 'Small Warriors', 'Baby Dragons', 'Kid Eagles'],
    'Male U10': ['Thunder Youth', 'Lightning Kids', 'Phoenix Juniors', 'Storm Youth', 'Titans Kids', 'Warriors Youth', 'Dragons Juniors', 'Eagles Kids'],
    'Male U12': ['Thunder Academy', 'Lightning Academy', 'Phoenix Academy', 'Storm Academy', 'Titans Academy', 'Warriors Academy', 'Dragons Academy', 'Eagles Academy'],
    'Male U14': ['Thunder Elite', 'Lightning Elite', 'Phoenix Elite', 'Storm Elite', 'Titans Elite', 'Warriors Elite', 'Dragons Elite', 'Eagles Elite'],
    'Male U16': ['Thunder Select', 'Lightning Select', 'Phoenix Select', 'Storm Select', 'Titans Select', 'Warriors Select', 'Dragons Select', 'Eagles Select'],
    'Male U18': ['Thunder Premier', 'Lightning Premier', 'Phoenix Premier', 'Storm Premier', 'Titans Premier', 'Warriors Premier', 'Dragons Premier', 'Eagles Premier'],
    // Youth teams - Female
    'Female U8': ['Star Strikers', 'Dream Team', 'Mighty Girls', 'Soccer Sisters', 'Pink Panthers', 'Goal Getters', 'Victory Squad', 'Champion Girls'],
    'Female U10': ['Thunder Girls', 'Lightning Ladies', 'Phoenix Stars', 'Storm Girls', 'Titans Youth', 'Warriors Girls', 'Dragons Youth', 'Eagles Girls'],
    'Female U12': ['Star Academy', 'Dream Academy', 'Phoenix Girls', 'Storm Academy', 'Titans Girls', 'Warriors Academy', 'Dragons Girls', 'Eagles Academy'],
    'Female U14': ['Star Elite', 'Dream Elite', 'Phoenix Elite', 'Storm Elite', 'Titans Elite', 'Warriors Elite', 'Dragons Elite', 'Eagles Elite'],
    'Female U16': ['Star Select', 'Dream Select', 'Phoenix Select', 'Storm Select', 'Titans Select', 'Warriors Select', 'Dragons Select', 'Eagles Select'],
    'Female U18': ['Star Premier', 'Dream Premier', 'Phoenix Premier', 'Storm Premier', 'Titans Premier', 'Warriors Premier', 'Dragons Premier', 'Eagles Premier']
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

const adultLeagues = {
  Men: generateTeams('Men', 8),
  Women: generateTeams('Women', 8),
  Coed: generateTeams('Coed', 8),
  'Over 40': generateTeams('Over 40', 8),
  'Over 50': generateTeams('Over 50', 8)
};

const youthLeagues = {
  'Male U8': generateTeams('Male U8', 8),
  'Male U10': generateTeams('Male U10', 8),
  'Male U12': generateTeams('Male U12', 8),
  'Male U14': generateTeams('Male U14', 8),
  'Male U16': generateTeams('Male U16', 8),
  'Male U18': generateTeams('Male U18', 8),
  'Female U8': generateTeams('Female U8', 8),
  'Female U10': generateTeams('Female U10', 8),
  'Female U12': generateTeams('Female U12', 8),
  'Female U14': generateTeams('Female U14', 8),
  'Female U16': generateTeams('Female U16', 8),
  'Female U18': generateTeams('Female U18', 8)
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

type LeagueCategory = 'Adult' | 'Youth';
type YouthGender = 'Male' | 'Female';

type LeagueData = {
  [key: string]: Team[];
};

const LeagueTable: React.FC = () => {
  const [category, setCategory] = useState<LeagueCategory>('Adult');
  const [youthGender, setYouthGender] = useState<YouthGender>('Male');
  const [selectedGroup, setSelectedGroup] = useState<string>('Men');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const currentLeagues: LeagueData = category === 'Adult' ? adultLeagues : youthLeagues;
  
  // Get league groups based on category and gender
  const getLeagueGroups = (): string[] => {
    if (category === 'Adult') {
      return Object.keys(adultLeagues);
    } else {
      // Filter youth leagues by selected gender
      return Object.keys(youthLeagues).filter(key => key.startsWith(youthGender));
    }
  };
  
  const leagueGroups = getLeagueGroups();

  const handleCategoryChange = (newCategory: LeagueCategory) => {
    setCategory(newCategory);
    if (newCategory === 'Adult') {
      setSelectedGroup('Men');
    } else {
      setSelectedGroup(`${youthGender} U8`);
    }
    setSelectedTeam(null);
    setMobileDropdownOpen(false);
  };

  const handleYouthGenderChange = (gender: YouthGender) => {
    setYouthGender(gender);
    setSelectedGroup(`${gender} U8`);
    setSelectedTeam(null);
    setMobileDropdownOpen(false);
  };

  const handleGroupChange = (group: string) => {
    setSelectedGroup(group);
    setSelectedTeam(null);
    setMobileDropdownOpen(false);
  };

  const handleTeamClick = (team: Team) => {
    const schedule = generateSchedule(
      team.name,
      currentLeagues[selectedGroup],
      team.mp
    );
    setSelectedTeam({ ...team, schedule });
  };

  // Extract just the age group for display (e.g., "Male U12" -> "U12")
  const getDisplayGroup = (group: string): string => {
    if (category === 'Youth') {
      return group.replace('Male ', '').replace('Female ', '');
    }
    return group;
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

        {/* Category Cards */}
        <div className={styles.categoryCards}>
          <button
            onClick={() => handleCategoryChange('Adult')}
            className={`${styles.categoryCard} ${category === 'Adult' ? styles.categoryCardActive : ''}`}
          >
            <div className={styles.categoryTitle}>Adult Leagues</div>
            <div className={styles.categorySubtitle}>Men • Women • Coed • Over 40 • Over 50</div>
          </button>
          <button
            onClick={() => handleCategoryChange('Youth')}
            className={`${styles.categoryCard} ${category === 'Youth' ? styles.categoryCardActive : ''}`}
          >
            <div className={styles.categoryTitle}>Youth Leagues</div>
            <div className={styles.categorySubtitle}>U8 • U10 • U12 • U14 • U16 • U18</div>
          </button>
        </div>

        {/* Youth Gender Tabs */}
        {category === 'Youth' && (
          <div className={styles.genderTabs}>
            <button
              onClick={() => handleYouthGenderChange('Male')}
              className={`${styles.genderTab} ${youthGender === 'Male' ? styles.genderTabActive : ''}`}
            >
              Male
            </button>
            <button
              onClick={() => handleYouthGenderChange('Female')}
              className={`${styles.genderTab} ${youthGender === 'Female' ? styles.genderTabActive : ''}`}
            >
              Female
            </button>
          </div>
        )}
        
        {/* League Group Tabs - Desktop */}
        <div className={styles.tabsDesktop}>
          {leagueGroups.map(group => (
            <button
              key={group}
              onClick={() => handleGroupChange(group)}
              className={`${styles.tab} ${selectedGroup === group ? styles.tabActive : ''}`}
            >
              {getDisplayGroup(group)}
            </button>
          ))}
        </div>

        {/* League Group Dropdown - Mobile */}
        <div className={styles.tabsMobile}>
          <button
            onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
            className={styles.mobileDropdownButton}
          >
            <span>{getDisplayGroup(selectedGroup)}</span>
            <ChevronDown className={`${styles.chevronIcon} ${mobileDropdownOpen ? styles.chevronIconOpen : ''}`} />
          </button>
          {mobileDropdownOpen && (
            <div className={styles.mobileDropdownMenu}>
              {leagueGroups.map(group => (
                <button
                  key={group}
                  onClick={() => handleGroupChange(group)}
                  className={`${styles.mobileDropdownItem} ${selectedGroup === group ? styles.mobileDropdownItemActive : ''}`}
                >
                  {getDisplayGroup(group)}
                </button>
              ))}
            </div>
          )}
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
                {currentLeagues[selectedGroup]?.map((team: Team, index: number) => {
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