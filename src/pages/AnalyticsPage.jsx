import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { SALESPERSONS, PIPELINE_STAGES, monthlyRevenueData, leadSourceData, stageConversionData } from '../data/mockData';

const CHART_COLORS = ['#171717', '#4d4d4d', '#8f8f8f', '#0070f3', '#7928ca', '#50e3c2'];
const SOURCE_COLORS = ['#171717', '#0070f3', '#7928ca', '#50e3c2', '#f5a623', '#ee0000'];

function formatGBP(v) {
  if (v >= 1000) return `£${(v / 1000).toFixed(0)}k`;
  return `£${v}`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-elevated)',
      border: '1px solid var(--color-hairline)',
      borderRadius: 'var(--r-sm)',
      padding: '8px 12px',
      fontSize: 12,
      boxShadow: 'var(--shadow-float)',
    }}>
      <div style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: 'var(--color-body)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ textTransform: 'capitalize' }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
            {typeof p.value === 'number' && p.name !== 'count' ? `£${p.value.toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage({ leads }) {
  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.stage === 'won');
  const lostLeads = leads.filter(l => l.stage === 'lost');
  const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.stage));
  const totalRevenue = wonLeads.reduce((sum, l) => sum + l.expectedRevenue, 0);
  const pipelineValue = activeLeads.reduce((sum, l) => sum + l.expectedRevenue, 0);
  const conversionRate = totalLeads > 0 ? ((wonLeads.length / totalLeads) * 100).toFixed(0) : 0;
  const avgDeal = wonLeads.length > 0 ? Math.round(totalRevenue / wonLeads.length) : 0;

  // Per-salesperson stats
  const spStats = SALESPERSONS.map(sp => {
    const spLeads = leads.filter(l => l.salesperson === sp.id);
    const spWon = spLeads.filter(l => l.stage === 'won');
    const spRevenue = spWon.reduce((sum, l) => sum + l.expectedRevenue, 0);
    const spPipeline = spLeads.filter(l => !['won', 'lost'].includes(l.stage)).reduce((sum, l) => sum + l.expectedRevenue, 0);
    return {
      ...sp,
      total: spLeads.length,
      won: spWon.length,
      revenue: spRevenue,
      pipeline: spPipeline,
      conversion: spLeads.length > 0 ? Math.round((spWon.length / spLeads.length) * 100) : 0,
    };
  });

  // Stage distribution from live leads
  const stageData = PIPELINE_STAGES.map(s => ({
    stage: s.label.replace(' Lead', '').replace(' Sent', ''),
    count: leads.filter(l => l.stage === s.id).length,
  }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Analytics</div>
          <div className="page-subtitle">Performance overview across the full pipeline</div>
        </div>
      </div>

      <div className="page-body">
        <div className="analytics-grid">
          {/* KPI row */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Total leads</div>
              <div className="stat-value">{totalLeads}</div>
              <div className="stat-sub">{activeLeads.length} active in pipeline</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Revenue won</div>
              <div className="stat-value">£{(totalRevenue / 1000).toFixed(1)}k</div>
              <div className="stat-sub">{wonLeads.length} deals closed</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pipeline value</div>
              <div className="stat-value">£{(pipelineValue / 1000).toFixed(1)}k</div>
              <div className="stat-sub">{activeLeads.length} open deals</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Conversion rate</div>
              <div className="stat-value">{conversionRate}%</div>
              <div className="stat-sub">Avg deal £{avgDeal.toLocaleString()}</div>
            </div>
          </div>

          {/* Revenue chart + source pie */}
          <div className="charts-row">
            <div className="chart-card">
              <div className="chart-title">Monthly revenue trend</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyRevenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wonGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#171717" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="#171717" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="pipeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0070f3" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="#0070f3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ebebeb" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8f8f8f' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formatGBP} tick={{ fontSize: 11, fill: '#8f8f8f' }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="won" name="won" stroke="#171717" strokeWidth={1.5} fill="url(#wonGrad)" />
                  <Area type="monotone" dataKey="pipeline" name="pipeline" stroke="#0070f3" strokeWidth={1.5} fill="url(#pipeGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-title">Lead sources</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={leadSourceData}
                    cx="50%"
                    cy="45%"
                    innerRadius={52}
                    outerRadius={80}
                    dataKey="count"
                    nameKey="source"
                    paddingAngle={2}
                  >
                    {leadSourceData.map((entry, i) => (
                      <Cell key={entry.source} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, name) => [v, name]} contentStyle={{ fontSize: 12, border: '1px solid #ebebeb', borderRadius: 6 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stage bar chart */}
          <div className="charts-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="chart-card">
              <div className="chart-title">Leads by stage</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stageData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ebebeb" vertical={false} />
                  <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#8f8f8f' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#8f8f8f' }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="leads" fill="#171717" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-title">Win / Loss summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)', marginTop: 'var(--sp-xs)' }}>
                {[
                  { label: 'Won', count: wonLeads.length, value: totalRevenue, color: '#0070f3' },
                  { label: 'Active pipeline', count: activeLeads.length, value: pipelineValue, color: '#171717' },
                  { label: 'Lost', count: lostLeads.length, value: lostLeads.reduce((s, l) => s + l.expectedRevenue, 0), color: '#8f8f8f' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 13, color: 'var(--color-body)' }}>{row.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)' }}>{row.count} leads</div>
                    <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-mute)', width: 72, textAlign: 'right' }}>£{row.value.toLocaleString()}</div>
                  </div>
                ))}
                <div style={{ marginTop: 'var(--sp-md)', borderTop: '1px solid var(--color-hairline)', paddingTop: 'var(--sp-md)' }}>
                  <div style={{ fontSize: 12, color: 'var(--color-mute)', marginBottom: 4 }}>Overall conversion</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)' }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--color-hairline-soft)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${conversionRate}%`, background: 'var(--color-ink)', borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>{conversionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Salesperson breakdown */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--sp-md)', letterSpacing: '-0.2px' }}>Salesperson performance</div>
            <div className="salesperson-row">
              {spStats.map(sp => (
                <div key={sp.id} className="sp-card">
                  <div className="sp-card-header">
                    <div className="avatar avatar-md">{sp.avatar}</div>
                    <div>
                      <div className="sp-card-name">{sp.name}</div>
                      <div className="sp-card-role">Sales representative</div>
                    </div>
                  </div>
                  <div className="sp-stats">
                    <div>
                      <div className="sp-stat-label">Leads</div>
                      <div className="sp-stat-value">{sp.total}</div>
                    </div>
                    <div>
                      <div className="sp-stat-label">Won</div>
                      <div className="sp-stat-value">{sp.won}</div>
                    </div>
                    <div>
                      <div className="sp-stat-label">Conv.</div>
                      <div className="sp-stat-value">{sp.conversion}%</div>
                    </div>
                    <div style={{ gridColumn: 'span 3', marginTop: 'var(--sp-xs)', paddingTop: 'var(--sp-xs)', borderTop: '1px solid var(--color-hairline)' }}>
                      <div className="sp-stat-label">Revenue won</div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.3px', fontFamily: 'var(--font-mono)' }}>£{sp.revenue.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
