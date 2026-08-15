export type Gender = "male" | "female" | "non_binary" | "prefer_not_to_say";
export type SkillLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "competitive";
export type HkDistrict =
  | "central_western"
  | "wan_chai"
  | "eastern"
  | "southern"
  | "yau_tsim_mong"
  | "sham_shui_po"
  | "kowloon_city"
  | "wong_tai_sin"
  | "kwun_tong"
  | "kwai_tsing"
  | "tsuen_wan"
  | "tuen_mun"
  | "yuen_long"
  | "north"
  | "tai_po"
  | "sha_tin"
  | "sai_kung"
  | "islands";
export type VenueType = "public" | "private" | "school" | "club" | "other";
export type GameStatus = "open" | "full" | "cancelled" | "completed";
export type CostSplitMode = "all_players" | "joiners_only";
export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "waitlisted";
export type AttendanceStatus = "pending" | "present" | "no_show";
export type FriendshipStatus = "pending" | "accepted" | "blocked";
export type ChatRoomType = "direct" | "group" | "game";
export type MessageType = "text" | "system";
export type MemberRole = "owner" | "admin" | "member";

export const HK_DISTRICT_LABELS: Record<HkDistrict, string> = {
  central_western: "中西區",
  wan_chai: "灣仔區",
  eastern: "東區",
  southern: "南區",
  yau_tsim_mong: "油尖旺區",
  sham_shui_po: "深水埗區",
  kowloon_city: "九龍城區",
  wong_tai_sin: "黃大仙區",
  kwun_tong: "觀塘區",
  kwai_tsing: "葵青區",
  tsuen_wan: "荃灣區",
  tuen_mun: "屯門區",
  yuen_long: "元朗區",
  north: "北區",
  tai_po: "大埔區",
  sha_tin: "沙田區",
  sai_kung: "西貢區",
  islands: "離島區",
};

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: "新手",
  intermediate: "進階",
  advanced: "高手",
  competitive: "競技",
};

export const PROFILE_SKILL_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "competitive",
] as const satisfies readonly SkillLevel[];

export const GENDER_LABELS: Record<Gender, string> = {
  male: "男",
  female: "女",
  non_binary: "非二元",
  prefer_not_to_say: "不透露",
};

export const GAME_STATUS_LABELS: Record<GameStatus, string> = {
  open: "開放中",
  full: "已滿",
  cancelled: "已取消",
  completed: "已完成",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "待審批",
  accepted: "已接受",
  rejected: "已拒絕",
  withdrawn: "已撤回",
  waitlisted: "候補中",
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  pending: "未標記",
  present: "出席",
  no_show: "缺席",
};

export const FRIENDSHIP_STATUS_LABELS: Record<FriendshipStatus, string> = {
  pending: "待確認",
  accepted: "已是好友",
  blocked: "已封鎖",
};

export const HK_DISTRICT_OPTIONS = Object.entries(HK_DISTRICT_LABELS) as [
  HkDistrict,
  string,
][];

export interface Profile {
  id: string;
  nickname: string;
  gender: Gender | null;
  avatar_url: string | null;
  bio: string | null;
  district: HkDistrict | null;
  phone_visible_after_join: boolean;
  games_hosted_count: number;
  games_joined_count: number;
  games_completed_count: number;
  rating: number | null;
  rating_count: number;
  attendance_marked_count: number;
  attendance_present_count: number;
  attendance_rate: number | null;
  created_at: string;
  updated_at: string;
}

export interface Sport {
  id: string;
  slug: string;
  name_en: string;
  name_zh: string;
  min_players: number;
  is_active: boolean;
}

export interface UserSportSkill {
  user_id: string;
  sport_id: string;
  level: SkillLevel;
  updated_at: string;
}

export interface Venue {
  id: string;
  name_zh: string;
  name_en: string | null;
  district: HkDistrict;
  address: string | null;
  lat: number | null;
  lng: number | null;
  venue_type: VenueType;
  created_by: string | null;
  created_at: string;
}

export interface Game {
  id: string;
  host_id: string;
  sport_id: string;
  venue_id: string | null;
  venue_label: string;
  district: HkDistrict;
  lat: number | null;
  lng: number | null;
  starts_at: string;
  ends_at: string;
  max_players: number;
  current_players: number;
  spots_needed: number;
  total_cost_hkd: number;
  cost_split_mode: CostSplitMode;
  min_skill: SkillLevel | null;
  title: string;
  description: string | null;
  status: GameStatus;
  chat_room_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameParticipant {
  game_id: string;
  user_id: string;
  joined_at: string;
  attendance_status: AttendanceStatus;
  attendance_marked_by: string | null;
  attendance_marked_at: string | null;
}

export interface Application {
  id: string;
  game_id: string;
  applicant_id: string;
  message: string | null;
  status: ApplicationStatus;
  payment_proof_url: string | null;
  waitlisted_at: string | null;
  created_at: string;
  decided_at: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  game_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  owner_id: string;
  chat_room_id: string | null;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
}

export interface ChatRoom {
  id: string;
  type: ChatRoomType;
  title: string | null;
  created_at: string;
}

export interface ChatRoomMember {
  room_id: string;
  user_id: string;
  role: MemberRole;
  last_read_at: string | null;
  joined_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string | null;
  type: MessageType;
  content: string;
  created_at: string;
  deleted_at: string | null;
}
