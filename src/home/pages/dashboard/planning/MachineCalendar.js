import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDesign } from "../../../../API/Design_API";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import server from "../../../../server/server";

const MACHINE_COLOR_PALETTE = [
  "#0ea5e9",
  "#f97316",
  "#ef4444",
  "#6366f1",
  "#10b981",
  "#a855f7",
  "#f59e0b",
  "#14b8a6",
  "#ec4899",
  "#84cc16",
];

const MACHINE_TYPE_ORDER = ["coating", "printing", "varnish"];

const PLAN_SECTIONS = [
  { key: "coating_machine_plan", label: "Coating" },
  { key: "printing_machine_plan", label: "Printing" },
  { key: "varnish_machine_plan", label: "Varnish" },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap');

  .mc-root *, .mc-root *::before, .mc-root *::after { box-sizing: border-box; }

  .mc-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #f0f4f8;
    min-height: 100vh;
    color: #1e293b;
  }

  /* Header */
  .mc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 28px 0;
    flex-wrap: wrap;
    gap: 14px;
  }

  .mc-brand {
    display: flex;
    align-items: center;
    gap: 13px;
  }

  .mc-brand-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(37,99,235,0.35);
    flex-shrink: 0;
  }

  .mc-brand-title {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.5px;
    margin: 0 0 2px;
  }

  .mc-brand-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #94a3b8;
    letter-spacing: 1.3px;
    text-transform: uppercase;
    margin: 0;
  }

  /* Legend */
  .mc-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .mc-legend-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px 5px 8px;
    border-radius: 99px;
    background: #fff;
    border: 1.5px solid #e2e8f0;
    font-size: 11.5px;
    font-weight: 600;
    color: #475569;
    transition: border-color 0.15s, box-shadow 0.15s;
    cursor: default;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }

  .mc-legend-pill:hover {
    border-color: #cbd5e1;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    color: #1e293b;
  }

  .mc-legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* Stats */
  .mc-stats {
    display: flex;
    gap: 12px;
    padding: 18px 28px 14px;
    flex-wrap: wrap;
  }

  .mc-stat {
    flex: 1;
    min-width: 140px;
    background: #fff;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 13px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    transition: box-shadow 0.2s, transform 0.15s;
  }

  .mc-stat:hover {
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }

  .mc-stat-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }

  .mc-stat-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 24px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1;
    margin: 0 0 4px;
  }

  .mc-stat-lbl {
    font-size: 11px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-weight: 600;
    margin: 0;
  }

  /* Calendar Shell */
  .mc-cal-shell {
    margin: 0 20px 28px;
    border-radius: 16px;
    overflow: hidden;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  }

  /* FullCalendar Overrides */
  .mc-cal-shell .fc {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    --fc-border-color: #e9eef5;
    --fc-today-bg-color: rgba(37,99,235,0.04);
  }

  /* toolbar */
  .mc-cal-shell .fc-toolbar.fc-header-toolbar {
    background: #f8fafc;
    padding: 13px 18px;
    margin-bottom: 0 !important;
    border-bottom: 1.5px solid #e9eef5;
  }

  .mc-cal-shell .fc-toolbar-title {
    font-size: 15px !important;
    font-weight: 700 !important;
    color: #0f172a !important;
    letter-spacing: -0.3px;
  }

  /* nav buttons */
  .mc-cal-shell .fc-button {
    background: #fff !important;
    border: 1.5px solid #e2e8f0 !important;
    color: #64748b !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    padding: 5px 13px !important;
    border-radius: 8px !important;
    text-shadow: none !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
    transition: all 0.15s !important;
  }

  .mc-cal-shell .fc-button:hover {
    background: #f1f5f9 !important;
    border-color: #cbd5e1 !important;
    color: #334155 !important;
  }

  .mc-cal-shell .fc-button-primary:not(:disabled).fc-button-active,
  .mc-cal-shell .fc-button-primary:not(:disabled):active {
    background: linear-gradient(135deg, #2563eb, #0ea5e9) !important;
    border-color: transparent !important;
    color: #fff !important;
    box-shadow: 0 3px 10px rgba(37,99,235,0.3) !important;
  }

  .mc-cal-shell .fc-button-group { gap: 4px !important; }
  .mc-cal-shell .fc-button-group > .fc-button { margin: 0 !important; border-radius: 8px !important; }

  /* resource area */
  .mc-cal-shell .fc-datagrid-cell,
  .mc-cal-shell .fc-resource-timeline-divider {
    background: #f8fafc !important;
    border-color: #e9eef5 !important;
  }

  .mc-cal-shell .fc-datagrid-cell-main {
    color: #334155 !important;
    font-size: 12.5px !important;
    font-weight: 600 !important;
  }

  /* group rows */
  .mc-cal-shell .fc-resource-group .fc-datagrid-cell {
    background: #f1f5f9 !important;
  }

  .mc-cal-shell .fc-resource-group .fc-datagrid-cell-main {
    font-size: 9.5px !important;
    font-weight: 700 !important;
    color: #94a3b8 !important;
    letter-spacing: 1.4px !important;
    text-transform: uppercase !important;
  }

  .mc-cal-shell .fc-resource-group .fc-timeline-lane {
    background: #f8fafc !important;
  }

  /* slot labels */
  .mc-cal-shell .fc-timeline-slot-label {
    color: #94a3b8 !important;
    font-size: 10.5px !important;
    font-family: 'JetBrains Mono', monospace !important;
    font-weight: 500 !important;
    border-color: #e9eef5 !important;
  }

  /* lane rows */
  .mc-cal-shell .fc-timeline-lane {
    background: #fff !important;
    border-color: #f0f4f8 !important;
  }

  .mc-cal-shell .fc-timeline-lane:nth-child(odd) {
    background: #fafbfd !important;
  }

  /* now indicator */
  .mc-cal-shell .fc-timeline-now-indicator-line {
    border-color: #f59e0b !important;
    border-width: 2px !important;
  }
  .mc-cal-shell .fc-timeline-now-indicator-arrow {
    border-top-color: #f59e0b !important;
  }

  /* events */
  .mc-cal-shell .fc-event {
    border-radius: 6px !important;
    border: none !important;
    padding: 2px 8px !important;
    font-size: 11.5px !important;
    font-weight: 700 !important;
    letter-spacing: 0.1px;
    cursor: pointer !important;
    box-shadow: 0 1px 4px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.25) !important;
    transition: filter 0.12s, transform 0.12s !important;
    overflow: hidden !important;
    position: relative !important;
  }

  .mc-cal-shell .fc-event::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%);
    pointer-events: none;
    border-radius: 6px;
  }

  .mc-cal-shell .fc-event:hover {
    filter: brightness(1.1) saturate(1.15) !important;
    transform: scaleY(1.07) !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.22) !important;
    z-index: 5 !important;
  }

  /* scrollbar */
  .mc-cal-shell ::-webkit-scrollbar { height: 5px; width: 5px; }
  .mc-cal-shell ::-webkit-scrollbar-track { background: #f1f5f9; }
  .mc-cal-shell ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
  .mc-cal-shell ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

  /* Loading skeleton */
  .mc-skeleton {
    margin: 0 20px 28px;
    border-radius: 16px;
    background: #fff;
    border: 1.5px solid #e2e8f0;
    padding: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #94a3b8;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .mc-spinner {
    width: 18px;
    height: 18px;
    border: 2.5px solid #e2e8f0;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* Tooltip */
  .mc-tip {
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    background: #fff;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    padding: 14px 16px;
    min-width: 230px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    transform: translate(-50%, calc(-100% - 12px));
    animation: tipIn 0.14s cubic-bezier(0.16,1,0.3,1);
  }

  @keyframes tipIn {
    from { opacity: 0; transform: translate(-50%, calc(-100% - 7px)) scale(0.96); }
    to   { opacity: 1; transform: translate(-50%, calc(-100% - 12px)) scale(1); }
  }

  .mc-tip-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1.5px solid #f1f5f9;
  }

  .mc-tip-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .mc-tip-so {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    letter-spacing: 0.2px;
  }

  .mc-tip-row {
    display: flex;
    gap: 10px;
    margin-bottom: 5px;
    font-size: 12px;
    align-items: flex-start;
  }
  .mc-tip-row:last-child { margin-bottom: 0; }

  .mc-tip-k {
    color: #94a3b8;
    min-width: 76px;
    flex-shrink: 0;
    font-size: 11px;
    padding-top: 1px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    font-weight: 600;
  }

  .mc-tip-v {
    color: #475569;
    font-weight: 500;
  }
  .mc-tip-v.hi { color: #0f172a; font-weight: 700; }
`;

const buildMachineStructures = (apiData = []) => {
  const groupMap = {};
  apiData.forEach(({ machine_name, machine_type }) => {
    const type = machine_type?.toLowerCase() || "other";
    if (!groupMap[type]) groupMap[type] = [];
    groupMap[type].push(machine_name);
  });

  const machineColors = {};
  let colorIdx = 0;
  const orderedTypes = [
    ...MACHINE_TYPE_ORDER.filter((t) => groupMap[t]),
    ...Object.keys(groupMap).filter((t) => !MACHINE_TYPE_ORDER.includes(t)),
  ];

  const machineList = orderedTypes.map((type) => {
    const machines = groupMap[type] || [];
    const children = machines.map((machineName) => {
      const color =
        MACHINE_COLOR_PALETTE[colorIdx % MACHINE_COLOR_PALETTE.length];
      colorIdx++;
      machineColors[machineName] = color;
      return {
        id: machineName,
        title: machineName,
        eventColor: color,
        labelColor: color,
      };
    });

    return {
      id: type,
      title:
        `${type.charAt(0).toUpperCase() + type.slice(1)} Machines`.toUpperCase(),
      children,
    };
  });

  return { machineList, machineColors };
};

const useDynamicMachines = () => {
  const [machineList, setMachineList] = useState([]);
  const [machineColors, setMachineColors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const res = await server.get("/machine/all");
        const data = res.data.data || [];
        const { machineList: list, machineColors: colors } =
          buildMachineStructures(data);
        setMachineList(list);
        setMachineColors(colors);
      } catch (err) {
        console.error("Failed to fetch machines for calendar", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMachines();
  }, []);

  return { machineList, machineColors, loading };
};

function MachineCalendar() {
  const { designs } = useDesign();
  const calRef = useRef(null);
  const [tip, setTip] = useState(null);

  const { machineList, machineColors, loading } = useDynamicMachines();

  const events = useMemo(() => {
    if (!designs?.length) return [];

    return designs.flatMap((d) => {
      if (d.planning_status !== 2) return [];

      return PLAN_SECTIONS.flatMap(({ key, label }) => {
        const bookings = d?.planning_work_details?.[key]?.bookings;
        if (!bookings?.length) return [];

        return bookings.map((b, i) => ({
          id: `${d.saleorder_no}-${label}-${b.component}-${b.process}-${i}`,
          resourceId: b.machine,
          title: d.saleorder_no,
          start: b.shift_from_dt ?? null,
          end: b.shift_to_dt ?? null,
          color: machineColors[b.machine] || "#64748b",
          extendedProps: {
            customer: d.customer_name,
            process: label,
            component: b.component,
            soNumber: d.saleorder_no,
            machine: b.machine,
          },
        }));
      });
    });
  }, [designs, machineColors]);

  const stats = useMemo(() => {
    const sos = new Set(),
      machines = new Set();
    events.forEach((e) => {
      sos.add(e.extendedProps.soNumber);
      machines.add(e.resourceId);
    });
    return { orders: sos.size, machines: machines.size, shifts: events.length };
  }, [events]);

  const onEventEnter = (info) => {
    const { customer, process, component, soNumber, machine } =
      info.event.extendedProps;
    const rect = info.el.getBoundingClientRect();
    setTip({
      soNumber,
      customer,
      process,
      component,
      machine,
      color: machineColors[machine] || "#64748b",
      from: dayjs(info.event.start).format("DD MMM YYYY  HH:mm"),
      to: info.event.end
        ? dayjs(info.event.end).format("DD MMM YYYY  HH:mm")
        : "—",
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY,
    });
  };

  const onEventLeave = () => setTip(null);

  const onResourceLabel = (info) => {
    const color = info.resource.extendedProps?.labelColor;
    if (color) info.el.style.color = color;
  };

  return (
    <>
      <style>{STYLES}</style>

      <div className="mc-root">
        {/* Header */}
        <div className="mc-header">
          <div className="mc-brand">
            <div className="mc-brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3.5"
                  stroke="white"
                  strokeWidth="1.8"
                />
              </svg>
            </div>
            <div>
              <p className="mc-brand-title">Machine Calendar</p>
              <p className="mc-brand-sub">Production Shift Planner</p>
            </div>
          </div>

          <div className="mc-legend">
            {Object.entries(machineColors).map(([name, color]) => (
              <span key={name} className="mc-legend-pill">
                <span className="mc-legend-dot" style={{ background: color }} />
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mc-stats">
          {[
            {
              icon: "📋",
              bg: "#eff6ff",
              num: stats.orders,
              lbl: "Active Orders",
            },
            {
              icon: "⚙️",
              bg: "#fff7ed",
              num: stats.machines,
              lbl: "Machines In Use",
            },
            {
              icon: "🔄",
              bg: "#f0fdf4",
              num: stats.shifts,
              lbl: "Planned Shifts",
            },
          ].map(({ icon, bg, num, lbl }) => (
            <div key={lbl} className="mc-stat">
              <div className="mc-stat-icon" style={{ background: bg }}>
                {icon}
              </div>
              <div>
                <p className="mc-stat-num">{num}</p>
                <p className="mc-stat-lbl">{lbl}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar */}
        {loading ? (
          <div className="mc-skeleton">
            <div className="mc-spinner" />
            Loading machine resources…
          </div>
        ) : (
          <div className="mc-cal-shell">
            <FullCalendar
              ref={calRef}
              plugins={[resourceTimelinePlugin, interactionPlugin]}
              schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
              initialView="resourceTimelineMonth"
              views={{
                resourceTimelineDay: { buttonText: "Day" },
                resourceTimelineWeek: { buttonText: "Week" },
                resourceTimelineMonth: { buttonText: "Month" },
                resourceTimelineYear: { buttonText: "Year" },
              }}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right:
                  "resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth,resourceTimelineYear",
              }}
              nowIndicator={true}
              resources={machineList}
              events={events}
              height="auto"
              resourceAreaWidth={200}
              slotMinWidth={46}
              resourceLabelDidMount={onResourceLabel}
              eventMouseEnter={onEventEnter}
              eventMouseLeave={onEventLeave}
            />
          </div>
        )}
      </div>

      {/* Tooltip */}
      {tip && (
        <div className="mc-tip" style={{ left: tip.x, top: tip.y }}>
          <div className="mc-tip-head">
            <span className="mc-tip-dot" style={{ background: tip.color }} />
            <span className="mc-tip-so">{tip.soNumber}</span>
          </div>
          {[
            { k: "Customer", v: tip.customer, hi: true },
            { k: "Process", v: tip.process, hi: false },
            { k: "Component", v: tip.component, hi: false },
            { k: "Machine", v: tip.machine, hi: false },
            { k: "From", v: tip.from, hi: false },
            { k: "To", v: tip.to, hi: false },
          ].map(({ k, v, hi }) => (
            <div key={k} className="mc-tip-row">
              <span className="mc-tip-k">{k}</span>
              <span className={`mc-tip-v${hi ? " hi" : ""}`}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default MachineCalendar;
