export interface Reward {
  label: string;
  value: string;
  note?: string;
}

export interface ScheduleWeek {
  week: string;
  detail: string;
}

export interface ConsolationBracket {
  title: string;
  detail: string;
  weeks: ScheduleWeek[];
}

export interface RulesYear {
  year: string;
  teamCount: number;
  regularSeasonWeeks: number;
  postseasonWeeks: number;
  rewards: Reward[];
  trophyNote?: string;
  notes?: string[];
  regularSeasonDetail: string;
  playoffTeamCount: number;
  playoffWeeks: ScheduleWeek[];
  playoffNote?: string;
  sackoNote?: string;
  consolation?: ConsolationBracket;
  sackoTeamCount: number;
  sackoWeeks: ScheduleWeek[];
  sackoPunishment: string;
  sackoWarning: string;
  sackoDescription?: string;
  useDiagrams: boolean;
}

// Ordered newest-first; rulesYears[0] is the default season shown.
export const rulesYears: RulesYear[] = [
  {
    year: '2026',
    teamCount: 12,
    regularSeasonWeeks: 14,
    postseasonWeeks: 3,
    rewards: [
      { label: 'Buy-in', value: '$100', note: '$1,200 total pool' },
      { label: '1st Place', value: '$690' },
      { label: '2nd Place', value: '$200' },
      { label: '3rd Place', value: '$100' },
      { label: 'Weekly High PF', value: '$15', note: '$210 total' },
    ],
    trophyNote: 'Winner brings the trophy to All-Star Weekend.',
    regularSeasonDetail: 'All league members will play 8 opponents once and 3 flex-selected opponents twice.',
    playoffTeamCount: 8,
    playoffWeeks: [
      { week: 'Week 15', detail: 'Quarterfinals (top 2 seeds may choose matchup)' },
      { week: 'Week 16', detail: 'Semifinals' },
      { week: 'Week 17', detail: 'Championship, 3rd-place game' },
    ],
    consolation: {
      title: 'Consolation',
      detail: 'The 4 playoff teams that lose in the quarterfinals play in a consolation tournament.',
      weeks: [
        { week: 'Week 16', detail: 'Consolation Semifinals' },
        { week: 'Week 17', detail: '5th-place game, 7th-place game' },
      ],
    },
    playoffNote: 'Not play-in/ladder style.',
    sackoTeamCount: 4,
    sackoWeeks: [
      { week: 'Week 15', detail: 'Sacko Semifinals' },
      { week: 'Week 16', detail: 'Sacko Bowl' },
    ],
    sackoPunishment: 'The Sacko will be awarded to the loser of the Sacko Bowl.',
    sackoWarning: 'Failure to complete the Sacko results in removal from the league.',
    sackoDescription: 'Sacko details pending.',
    useDiagrams: true,
  },
  {
    year: '2025',
    teamCount: 12,
    regularSeasonWeeks: 14,
    postseasonWeeks: 3,
    rewards: [
      { label: 'Buy-in', value: '$100', note: '$1,200 total pool' },
      { label: '1st Place', value: '$690' },
      { label: '2nd Place', value: '$200' },
      { label: '3rd Place', value: '$100' },
      { label: 'Weekly High PF', value: '$15', note: '$210 total' },
    ],
    trophyNote: 'Winner brings the trophy to All-Star Weekend.',
    regularSeasonDetail: 'All league members will play 8 opponents once and 3 flex-selected opponents twice.',
    playoffTeamCount: 8,
    playoffWeeks: [
      { week: 'Week 15', detail: 'Quarterfinals (top 2 seeds may choose matchup)' },
      { week: 'Week 16', detail: 'Semifinals' },
      { week: 'Week 17', detail: 'Championship, 3rd-place game' },
    ],
    consolation: {
      title: 'Consolation',
      detail: 'The 4 playoff teams that lose in the quarterfinals play in a consolation tournament.',
      weeks: [
        { week: 'Week 16', detail: 'Consolation Semifinals' },
        { week: 'Week 17', detail: '5th-place game, 7th-place game' },
      ],
    },
    playoffNote: 'Not play-in/ladder style.',
    sackoTeamCount: 4,
    sackoWeeks: [
      { week: 'Week 15', detail: 'Sacko Semifinals' },
      { week: 'Week 16', detail: 'Sacko Bowl' },
    ],
    sackoPunishment: 'The Sacko will be awarded to the loser of the Sacko Bowl.',
    sackoWarning: 'Failure to complete the Sacko results in removal from the league.',
    sackoDescription: 'The Sacko must busk in a New York subway station.',
    useDiagrams: false,
  },
  {
    year: '2024',
    teamCount: 12,
    regularSeasonWeeks: 14,
    postseasonWeeks: 3,
    rewards: [
      { label: 'Buy-in', value: '$92', note: '$960 prize; $144 trophy reserves' },
      { label: '1st Place', value: '$490' },
      { label: '2nd Place', value: '$140' },
      { label: '3rd Place', value: '$70' },
      { label: 'Regular Season Winner', value: '$50' },
      { label: 'Weekly High PF', value: '$15', note: '$210 total' },
    ],
    notes: ['Winner pays for trophy shipping.'],
    regularSeasonDetail: 'All league members will play 8 opponents once and 3 flex-selected opponents twice.',
    playoffTeamCount: 8,
    playoffWeeks: [
      { week: 'Week 15', detail: 'Quarterfinals' },
      { week: 'Week 16', detail: 'Semifinals' },
      { week: 'Week 17', detail: 'Championship, 3rd-place game' },
    ],
    consolation: {
      title: 'Consolation',
      detail: 'The 4 playoff teams that lose in the quarterfinals play in a consolation tournament.',
      weeks: [
        { week: 'Week 16', detail: 'Consolation Semifinals' },
        { week: 'Week 17', detail: '5th-place game, 7th-place game' },
      ],
    },
    sackoTeamCount: 4,
    sackoWeeks: [
      { week: 'Week 15', detail: '9v10 (winner safe), 11v12 (loser to Sacko bowl)' },
      { week: 'Week 16', detail: '9/10 loser vs. 11/12 winner (loser to Sacko bowl)' },
      { week: 'Week 17', detail: 'Sacko bowl' },
    ],
    sackoPunishment: 'The Sacko will be awarded to the loser of the Sacko bowl.',
    sackoWarning: 'Failure to complete the Sacko results in removal from the league.',
    sackoDescription: 'The Sacko must run a 5K dressed as Lola Bunny in an embarrassing costume and shotgun a beer at every mile.',
    useDiagrams: false,
  },
  {
    year: '2023',
    teamCount: 12,
    regularSeasonWeeks: 14,
    postseasonWeeks: 3,
    rewards: [
      { label: 'Buy-in', value: '$60' },
      { label: '1st Place', value: '$400' },
      { label: '2nd Place', value: '$120' },
      { label: '3rd Place', value: '$60' },
      { label: 'Weekly High PF', value: '$10' },
    ],
    regularSeasonDetail: 'All league members will play 8 opponents once and 3 randomly selected opponents twice.',
    playoffTeamCount: 8,
    playoffWeeks: [
      { week: 'Week 15', detail: 'Quarterfinals' },
      { week: 'Week 16', detail: 'Semifinals' },
      { week: 'Week 17', detail: 'Championship, 3rd-place game' },
    ],
    consolation: {
      title: 'Consolation',
      detail: 'The 4 playoff teams that lose in the quarterfinals play in a consolation tournament.',
      weeks: [
        { week: 'Week 16', detail: 'Consolation Semifinals' },
        { week: 'Week 17', detail: '5th-place game, 7th-place game' },
      ],
    },
    sackoTeamCount: 4,
    sackoWeeks: [
      { week: 'Week 16', detail: 'Sacko Semifinals' },
      { week: 'Week 17', detail: 'Sacko Bowl' },
    ],
    sackoPunishment: 'The Sacko will be awarded to the loser of the 11th-place game.',
    sackoWarning: 'Failure to complete the Sacko results in removal from the league.',
    sackoDescription: 'The Sacko must dress up and perform as a mime in a public location in their city.',
    useDiagrams: false,
  },
  {
    year: '2022',
    teamCount: 12,
    regularSeasonWeeks: 14,
    postseasonWeeks: 3,
    rewards: [
      { label: 'Buy-in', value: '$50', note: '$420 prize; $180 trophy reserves' },
      { label: '1st Place', value: '$265' },
      { label: '2nd Place', value: '$105' },
      { label: '3rd Place', value: '$50' },
    ],
    regularSeasonDetail: 'All league members will play 8 opponents once and 3 randomly pre-set opponents twice.',
    playoffTeamCount: 8,
    playoffWeeks: [
      { week: 'Week 15', detail: 'Quarterfinals' },
      { week: 'Week 16', detail: 'Semifinals' },
      { week: 'Week 17', detail: 'Championship, 3rd-place game' },
    ],
    consolation: {
      title: 'Consolation',
      detail: 'The 4 playoff teams that lose in the quarterfinals play in a consolation tournament.',
      weeks: [
        { week: 'Week 16', detail: 'Consolation Semifinals' },
        { week: 'Week 17', detail: '5th-place game (Consolation Champ), 7th-place game' },
      ],
    },
    sackoTeamCount: 4,
    sackoWeeks: [
      { week: 'Week 15', detail: '9v10, 11v12' },
      { week: 'Week 16', detail: '9v11, 10v12' },
      { week: 'Week 17', detail: '9v12, 10v11' },
    ],
    sackoPunishment: 'The Sacko will be awarded to the team with the worst 17-game record among the bottom four.',
    sackoWarning: 'Failure to complete the Sacko results in removal from the league.',
    sackoDescription: 'The Sacko must perform a comedy set at a comedy club.',
    sackoNote: 'The Sacko is awarded to the team with the worst 17-game record among the bottom four.',
    useDiagrams: false,
  },
  {
    year: '2021',
    teamCount: 12,
    regularSeasonWeeks: 14,
    postseasonWeeks: 3,
    rewards: [
      { label: 'Buy-in', value: '$40' },
      { label: '1st Place', value: '$250' },
      { label: '2nd Place', value: '$120' },
      { label: '3rd Place', value: '$70' },
      { label: '5th Place', value: '$40' },
    ],
    regularSeasonDetail: 'All league members will play 8 opponents once and 3 randomly pre-set opponents twice.',
    playoffTeamCount: 8,
    playoffWeeks: [
      { week: 'Week 15', detail: 'Quarterfinals' },
      { week: 'Week 16', detail: 'Semifinals' },
      { week: 'Week 17', detail: 'Championship, 3rd-place game' },
    ],
    consolation: {
      title: 'Consolation',
      detail: 'The 4 playoff teams that lose in the quarterfinals play in a consolation tournament.',
      weeks: [
        { week: 'Week 16', detail: 'Consolation Semifinals' },
        { week: 'Week 17', detail: '5th-place game (Consolation Champ), 7th-place game' },
      ],
    },
    sackoTeamCount: 4,
    sackoWeeks: [
      { week: 'Week 15', detail: '9v10, 11v12' },
      { week: 'Week 16', detail: '9v11, 10v12' },
      { week: 'Week 17', detail: '9v12, 10v11' },
    ],
    sackoPunishment: 'The Sacko will be awarded to the team with the worst 17-game record among the bottom four.',
    sackoWarning: 'Failure to complete the Sacko results in removal from the league.',
    sackoDescription: 'The Sacko must strip down to their underwear and wear a box in a public place that says they lost in fantasy football.',
    sackoNote: 'The Sacko is awarded to the team with the worst 17-game record among the bottom four.',
    useDiagrams: false,
  },
];
