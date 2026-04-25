import React from 'react';
import { ArrowLeft, Activity } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DashboardExample } from '../constants/dashboardData';
import { PinterestLayout } from './PinterestLayout';

// Import all widget components - using new minimal widget names
import {
  OpenPositions,
  CandidatePipeline,
  HiringFunnel,
  TopSources,
  TimeToHire,
  OfferAcceptance,
  RecentHires,
  RecruitmentTrends,
  CandidateQuality
} from '../dashboard/RecruitmentWidgets';

import {
  TotalHeadcount,
  NewHiresThisMonth,
  DepartmentBreakdown,
  HeadcountGrowth,
  TopPerformers,
  GeographicDistribution,
  AttritionRate,
  EmployeeTimeline,
  DiversityStats
} from '../dashboard/EmployeeDirectoryWidgets';

import {
  PerformanceOverview,
  TopPerformers as PerformanceTopPerformers,
  GoalCompletion,
  UpcomingReviews,
  PerformanceTrends,
  FeedbackSummary,
  ProbationProgress,
  CareerDevelopment
} from '../dashboard/PerformanceWidgets';

import {
  EngagementScore,
  SurveyParticipation,
  TeamSatisfaction,
  RecognitionProgram,
  WellnessPrograms,
  OneOnOneMeetings,
  EngagementTrends,
  PulseResults
} from '../dashboard/EngagementWidgets';

import {
  AttendanceOverview,
  WorkFromHome,
  OvertimeHours,
  LeaveRequests,
  PunctualityScore,
  AttendanceTrends,
  LateArrivals,
  TimeTracking
} from '../dashboard/TimeAttendanceWidgets';

import {
  PayrollOverview,
  AverageSalary,
  SalaryRanges,
  BonusDistribution,
  PayEquityAnalysis,
  BenefitsCost,
  CompensationTrends,
  DepartmentPayroll
} from '../dashboard/CompensationWidgets';

import {
  TrainingCompletion,
  SkillDevelopment,
  Certifications,
  LearningHours,
  TopLearners,
  CourseRatings,
  LearningPaths,
  LearningTrends
} from '../dashboard/LearningDevelopmentWidgets';

import {
  ComplianceScore,
  OpenViolations,
  PolicyAcknowledgment,
  AuditReadiness,
  TrainingCompliance,
  IncidentReports,
  RiskAssessment,
  ComplianceTrends
} from '../dashboard/ComplianceWidgets';

interface DashboardDetailViewProps {
  dashboard: DashboardExample;
  onBack: () => void;
}

// Pinterest-style timeline layout component is imported from PinterestLayout

export const DashboardDetailView: React.FC<DashboardDetailViewProps> = ({
  dashboard,
  onBack
}) => {
  const renderDashboardWidgets = () => {
    let widgets: React.ReactElement[] = [];

    switch (dashboard.category) {
      case 'recruitment':
        widgets = [
          <OpenPositions key="open-positions" />,
          <TimeToHire key="time-to-hire" />,
          <OfferAcceptance key="offer-acceptance" />,
          <CandidatePipeline key="candidate-pipeline" />,
          <HiringFunnel key="hiring-funnel" />,
          <TopSources key="top-sources" />,
          <RecentHires key="recent-hires" />,
          <RecruitmentTrends key="recruitment-trends" />,
          <CandidateQuality key="candidate-quality" />
        ];
        break;
      case 'demographics':
        widgets = [
          <TotalHeadcount key="total-headcount" />,
          <AttritionRate key="attrition" />,
          <NewHiresThisMonth key="new-hires" />,
          <DepartmentBreakdown key="departments" />,
          <HeadcountGrowth key="headcount-growth" />,
          <TopPerformers key="top-performers" />,
          <GeographicDistribution key="geographic" />,
          <EmployeeTimeline key="employee-timeline" />,
          <DiversityStats key="diversity-stats" />
        ];
        break;
      case 'performance':
        widgets = [
          <PerformanceOverview key="performance-overview" />,
          <PerformanceTopPerformers key="top-performers" />,
          <GoalCompletion key="goal-completion" />,
          <UpcomingReviews key="upcoming-reviews" />,
          <PerformanceTrends key="trends" />,
          <FeedbackSummary key="feedback-summary" />,
          <ProbationProgress key="probation" />,
          <CareerDevelopment key="career-development" />
        ];
        break;
      case 'engagement':
        widgets = [
          <EngagementScore key="engagement-score" />,
          <SurveyParticipation key="survey-participation" />,
          <TeamSatisfaction key="team-satisfaction" />,
          <RecognitionProgram key="recognition" />,
          <WellnessPrograms key="wellness" />,
          <OneOnOneMeetings key="one-on-ones" />,
          <EngagementTrends key="trends" />,
          <PulseResults key="pulse-results" />
        ];
        break;
      case 'attendance':
        widgets = [
          <AttendanceOverview key="attendance-overview" />,
          <WorkFromHome key="work-from-home" />,
          <OvertimeHours key="overtime" />,
          <LeaveRequests key="leave-requests" />,
          <PunctualityScore key="punctuality" />,
          <AttendanceTrends key="trends" />,
          <LateArrivals key="late-arrivals" />,
          <TimeTracking key="time-tracking" />
        ];
        break;
      case 'compensation':
        widgets = [
          <PayrollOverview key="payroll-overview" />,
          <AverageSalary key="average-salary" />,
          <SalaryRanges key="salary-ranges" />,
          <BonusDistribution key="bonus-distribution" />,
          <PayEquityAnalysis key="pay-equity" />,
          <BenefitsCost key="benefits-cost" />,
          <CompensationTrends key="compensation-trends" />,
          <DepartmentPayroll key="department-payroll" />
        ];
        break;
      case 'learning':
        widgets = [
          <TrainingCompletion key="training-completion" />,
          <SkillDevelopment key="skill-development" />,
          <Certifications key="certifications" />,
          <LearningHours key="learning-hours" />,
          <TopLearners key="top-learners" />,
          <CourseRatings key="course-ratings" />,
          <LearningPaths key="learning-paths" />,
          <LearningTrends key="learning-trends" />
        ];
        break;
      case 'compliance':
        widgets = [
          <ComplianceScore key="compliance-score" />,
          <OpenViolations key="open-violations" />,
          <PolicyAcknowledgment key="policy-acknowledgment" />,
          <AuditReadiness key="audit-readiness" />,
          <TrainingCompliance key="training-compliance" />,
          <IncidentReports key="incident-reports" />,
          <RiskAssessment key="risk-assessment" />,
          <ComplianceTrends key="compliance-trends" />
        ];
        break;
      default:
        return (
          <div className="bg-brown-50 rounded-lg p-8 text-center">
            <Activity className="w-12 h-12 text-brown-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Dashboard Under Development</h3>
            <p className="text-sm mb-6 max-w-2xl mx-auto" style={{ color: 'var(--color-text-tertiary)' }}>
              This dashboard example is currently being developed. Interactive widgets and real-time data visualization are coming soon.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={onBack}>
                Back to Dashboards
              </Button>
              <Button>
                Request Demo
              </Button>
            </div>
          </div>
        );
    }

    return <PinterestLayout>{widgets}</PinterestLayout>;
  };

  return (
    <div className="min-h-screen bg-brown-50/30">
      <div className="bg-white border-b border-brown-200 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-brown-50">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">{dashboard.title}</h1>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                  Dashboard Example
                </Badge>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                {dashboard.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {renderDashboardWidgets()}
        </div>
      </div>
    </div>
  );
};