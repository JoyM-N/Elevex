/**
 * Elevex TypeScript Types
 *
 * These interfaces mirror the shape of API Resources in Laravel.
 * Keep these in sync with the backend API Resources.
 *
 * Naming convention:
 *   Every type matches its Laravel API Resource name.
 *   e.g. UserResource.php → User interface here
 */

// ============================================================
// Auth
// ============================================================

export type UserRole = 'super_admin' | 'admin' | 'intern'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  role_label: string
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  email_verified: boolean
  team_role?: string | null
  active_internship?: Internship | null
  created_at: string
}

// ============================================================
// Internship
// ============================================================

export type InternshipStatus = 'active' | 'completed' | 'terminated' | 'archived'

export interface Internship {
  id: number
  department: string
  university: string | null
  student_id: string | null
  start_date: string
  end_date: string
  status: InternshipStatus
  notes: string | null
  user?: User
  supervisor?: User
  created_at: string
  updated_at: string
}

// ============================================================
// Project
// ============================================================

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Project {
  id: number
  title: string
  description: string | null
  status: ProjectStatus
  status_label: string
  priority: ProjectPriority
  priority_label: string
  start_date: string
  end_date: string
  is_locked: boolean
  days_until_deadline: number
  my_team_role?: string | null
  created_by?: User
  members?: ProjectMember[]
  milestones?: Milestone[]
  created_at: string
  updated_at: string
}

export type ProjectMember = User & {
  team_role?: string | null
}

// ============================================================
// Milestone
// ============================================================

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed'

export interface Milestone {
  id: number
  project_id: number
  title: string
  description: string | null
  status: MilestoneStatus
  start_date: string
  end_date: string
  is_overdue: boolean
  completion_percentage: number
  tasks?: Task[]
  project?: { id: number; title: string }
  created_at: string
  updated_at: string
}

// ============================================================
// Task
// ============================================================

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'completed' | 'blocked' | 'cancelled'
export type TaskType = 'project_task' | 'general_task'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Task {
  id: number
  title: string
  description: string | null
  task_type: TaskType
  task_type_label: string
  status: TaskStatus
  status_label: string
  priority: TaskPriority
  priority_label: string
  estimated_hours: number | null
  actual_hours: number | null
  deadline: string | null
  completed_at: string | null
  is_overdue: boolean
  is_terminal: boolean
  assigned_to?: User
  created_by?: User
  milestone?: Milestone
  created_at: string
  updated_at: string
}

// ============================================================
// Logbook
// ============================================================

export type LogbookStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'revision_needed'

export interface LogbookSignoff {
  id: number
  user_id: number
  approved_at: string
  note: string | null
  approved_by?: User
  created_at: string
}

export interface InternLogbookSummary {
  id: number
  name: string
  email: string
  entries_count: number
  pending_count: number
  approved_count: number
  revision_count: number
  draft_count: number
  total_hours: number
  is_finalized: boolean
  signoff: LogbookSignoff | null
}

export interface Logbook {
  id: number
  date: string
  hours_worked: number
  description: string
  blockers: string | null
  learning_outcome: string | null
  status: LogbookStatus
  status_label: string
  revision_note: string | null
  reviewed_at: string | null
  is_locked: boolean
  user?: User
  task?: Task
  approved_by?: User
  comments?: Comment[]
  files?: FileUpload[]
  created_at: string
  updated_at: string
}

// ============================================================
// Comment
// ============================================================

export interface Comment {
  id: number
  body: string
  user?: User
  created_at: string
  updated_at: string
}

// ============================================================
// File Upload
// ============================================================

export interface FileUpload {
  id: number
  original_name: string
  url: string
  mime_type: string
  size: number
  human_size: string
  is_image: boolean
  is_pdf: boolean
  created_at: string
}

// ============================================================
// Evaluation
// ============================================================

export interface Evaluation {
  id: number
  communication_score: number
  professionalism_score: number
  initiative_score: number
  problem_solving_score: number
  teamwork_score: number
  remarks: string | null
  average_score: number
  average_score_percentage: number
  user?: User
  internship?: Internship
  evaluated_by?: User
  created_at: string
  updated_at: string
}

// ============================================================
// Performance
// ============================================================

export type PerformanceGrade = 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement'

export interface PerformanceMetric {
  id: number
  completion_rate: number
  deadline_score: number
  consistency_score: number
  quality_score: number
  teamwork_score: number
  overall_score: number
  grade: PerformanceGrade
  calculated_at: string
  user?: User
  internship?: Internship
  created_at: string
  updated_at: string
}

// ============================================================
// Achievement
// ============================================================

export interface Achievement {
  id: number
  key: string
  name: string
  description: string
  icon: string | null
  awarded_at?: string
}

// ============================================================
// Skill
// ============================================================

export type SkillCategory = 'technical' | 'soft'
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface Skill {
  id: number
  name: string
  category: SkillCategory
  proficiency_level?: ProficiencyLevel
  endorsed_by?: number | null
  endorsed_at?: string | null
}

// ============================================================
// Recommendation Letter
// ============================================================

export type RecommendationStatus = 'pending' | 'approved' | 'rejected'

export interface RecommendationLetter {
  id: number
  status: RecommendationStatus
  status_label: string
  pdf_url: string | null
  generated_at: string | null
  approved_at: string | null
  admin_notes: string | null
  user?: User
  internship?: Internship
  approved_by?: User
  created_at: string
}

// ============================================================
// Sick Day
// ============================================================

export type SickDayStatus = 'pending' | 'approved' | 'rejected'

export interface SickDay {
  id: number
  date: string
  reason: string | null
  status: SickDayStatus
  admin_notes: string | null
  approved_at: string | null
  user?: User
  approved_by?: User
  created_at: string
}

// ============================================================
// Notification
// ============================================================

export interface Notification {
  id: string
  type: string
  message: string
  data: Record<string, unknown>
  read: boolean
  read_at: string | null
  created_at: string
}

// ============================================================
// API Response Envelopes
// ============================================================

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

// ============================================================
// Admin Dashboard (GET /v1/admin/dashboard)
// ============================================================

export type ProjectStatusKey =
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled'

export interface AdminDashboardTopPerformer {
  name: string
  overall_score: number
  grade: PerformanceGrade
}

export interface AdminDashboardPendingLogbook {
  id: number
  intern_name: string
  task_title: string
  date: string
  submitted_at: string
}

export interface AdminDashboardRecentTask {
  id: number
  title: string
  status: TaskStatus
  assigned_to: string
  deadline: string | null
}

export interface AdminDashboard {
  interns: {
    total: number
    active: number
  }
  projects: {
    total: number
    active: number
    by_status: Partial<Record<ProjectStatusKey, number>>
  }
  tasks: {
    due_this_week: number
    overdue: number
  }
  logbooks: {
    pending_review: number
    approved_today: number
  }
  top_performer: AdminDashboardTopPerformer | null
  pending_logbooks: AdminDashboardPendingLogbook[]
  recent_tasks: AdminDashboardRecentTask[]
}

// ============================================================
// Intern Dashboard (GET /v1/intern/dashboard)
// ============================================================

export type TeamRoleKey =
  | 'frontend'
  | 'backend'
  | 'full_stack'
  | 'devops'
  | 'design'
  | 'qa'
  | 'documentation'
  | 'solo'

export interface InternDashboardPerformance {
  overall_score: number | string
  grade: PerformanceGrade
  completion_rate: number | string
  deadline_score: number | string
  consistency_score: number | string
}

export interface InternDashboardAchievement {
  name: string
  icon: string | null
  awarded_at: string
}

export interface InternDashboardActiveProject {
  id: number
  title: string
  team_role: TeamRoleKey | string
  end_date: string
}

export interface InternDashboardDeadline {
  id: number
  title: string
  deadline: string
  priority: TaskPriority
  status: TaskStatus
}

export interface InternDashboard {
  tasks: {
    total: number
    completed: number
    in_progress: number
    overdue: number
    completion_rate: number
  }
  logbooks: {
    total: number
    approved: number
    draft: number
    hours_this_week: number
  }
  performance: InternDashboardPerformance | null
  recent_achievements: InternDashboardAchievement[]
  active_projects: InternDashboardActiveProject[]
  upcoming_deadlines: InternDashboardDeadline[]
}

