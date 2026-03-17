import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export function VisitorsChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="date" 
          stroke="#71717a" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#71717a" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#18181b', 
            border: '1px solid #27272a',
            borderRadius: '8px',
            color: '#ffffff'
          }}
          labelStyle={{ color: '#a1a1aa' }}
        />
        <Area 
          type="monotone" 
          dataKey="visitors" 
          stroke="#3b82f6" 
          strokeWidth={2}
          fill="url(#colorVisitors)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SessionsChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis 
          dataKey="date" 
          stroke="#71717a" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#71717a" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#18181b', 
            border: '1px solid #27272a',
            borderRadius: '8px',
            color: '#ffffff'
          }}
          labelStyle={{ color: '#a1a1aa' }}
        />
        <Line 
          type="monotone" 
          dataKey="sessions" 
          stroke="#10b981" 
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RevenueChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="date" 
          stroke="#71717a" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#71717a" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#18181b', 
            border: '1px solid #27272a',
            borderRadius: '8px',
            color: '#ffffff'
          }}
          labelStyle={{ color: '#a1a1aa' }}
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#8b5cf6" 
          strokeWidth={2}
          fill="url(#colorRevenue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
