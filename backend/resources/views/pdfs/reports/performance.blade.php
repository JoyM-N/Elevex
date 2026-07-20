<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Performance Report — {{ $intern->name }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; margin: 0; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { font-size: 20px; margin: 0 0 5px 0; }
        .header p { margin: 0; color: #666; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 14px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th { background-color: #333; color: white; padding: 8px; text-align: left; font-size: 11px; }
        td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 11px; }
        .score-grid { display: table; width: 100%; margin-bottom: 15px; }
        .score-box { display: table-cell; text-align: center; padding: 10px; border: 1px solid #ddd; }
        .score-value { font-size: 18px; font-weight: bold; }
        .score-label { font-size: 9px; color: #666; margin-top: 3px; }
        .overall { background-color: #333; color: white; padding: 15px; text-align: center; margin-bottom: 20px; }
        .overall .value { font-size: 36px; font-weight: bold; }
        .overall .grade { font-size: 16px; margin-top: 5px; }
        .footer { margin-top: 30px; text-align: center; color: #999; font-size: 10px; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Performance Report</h1>
        <p>{{ $intern->name }} &nbsp;|&nbsp; {{ $intern->email }}</p>
    </div>

    @if($metric)
    <div class="overall">
        <div class="value">{{ $metric->overall_score }}%</div>
        <div class="grade">{{ $grade }}</div>
    </div>

    <div class="section">
        <h2>Score Breakdown</h2>
        <div class="score-grid">
            <div class="score-box">
                <div class="score-value">{{ $metric->completion_rate }}%</div>
                <div class="score-label">Completion Rate (40%)</div>
            </div>
            <div class="score-box">
                <div class="score-value">{{ $metric->deadline_score }}%</div>
                <div class="score-label">Deadline Score (20%)</div>
            </div>
            <div class="score-box">
                <div class="score-value">{{ $metric->consistency_score }}%</div>
                <div class="score-label">Consistency (15%)</div>
            </div>
            <div class="score-box">
                <div class="score-value">{{ $metric->quality_score }}%</div>
                <div class="score-label">Quality (15%)</div>
            </div>
            <div class="score-box">
                <div class="score-value">{{ $metric->teamwork_score }}%</div>
                <div class="score-label">Teamwork (10%)</div>
            </div>
        </div>
    </div>
    @else
    <p style="text-align:center; color:#999;">No performance metrics calculated yet.</p>
    @endif

    <div class="section">
        <h2>Task Statistics</h2>
        <table>
            <tr><td>Total Tasks Assigned</td><td><strong>{{ $task_stats['total'] }}</strong></td></tr>
            <tr><td>Completed</td><td><strong>{{ $task_stats['completed'] }}</strong></td></tr>
            <tr><td>In Progress</td><td><strong>{{ $task_stats['in_progress'] }}</strong></td></tr>
            <tr><td>Overdue</td><td><strong>{{ $task_stats['overdue'] }}</strong></td></tr>
        </table>
    </div>

    <div class="section">
        <h2>Logbook Statistics</h2>
        <table>
            <tr><td>Total Submitted</td><td><strong>{{ $logbook_stats['total'] }}</strong></td></tr>
            <tr><td>Approved</td><td><strong>{{ $logbook_stats['approved'] }}</strong></td></tr>
            <tr><td>Pending Review</td><td><strong>{{ $logbook_stats['pending'] }}</strong></td></tr>
            <tr><td>Draft</td><td><strong>{{ $logbook_stats['draft'] }}</strong></td></tr>
        </table>
    </div>

    @if(count($achievements) > 0)
    <div class="section">
        <h2>Achievements Earned</h2>
        <table>
            <thead>
                <tr><th>Achievement</th><th>Description</th></tr>
            </thead>
            <tbody>
                @foreach($achievements as $achievement)
                <tr>
                    <td>{{ $achievement->name }}</td>
                    <td>{{ $achievement->description }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    @if(count($skills) > 0)
    <div class="section">
        <h2>Skills</h2>
        <table>
            <thead>
                <tr><th>Skill</th><th>Category</th><th>Proficiency</th><th>Endorsed</th></tr>
            </thead>
            <tbody>
                @foreach($skills as $skill)
                <tr>
                    <td>{{ $skill->name }}</td>
                    <td>{{ $skill->category }}</td>
                    <td>{{ $skill->pivot->proficiency_level }}</td>
                    <td>{{ $skill->pivot->endorsed_at ? 'Yes' : 'No' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <div class="footer">
        Generated by Elevex on {{ $generated_at }} &nbsp;|&nbsp; Confidential
    </div>
</body>
</html>