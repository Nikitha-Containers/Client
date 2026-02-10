import React, { useMemo } from "react";
import { useDesign } from "../../../../API/Design_API";
import { Box } from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";

function MachineCalendar() {
  const { designs } = useDesign();

  // Machine List for FullCalendar
  const machineList = [
    {
      id: "coating",
      title: "COATING MACHINES",
      children: [
        { id: "Machine 1", title: "Machine 1" },
        { id: "Machine 2", title: "Machine 2" },
        { id: "Machine 3", title: "Machine 3" },
      ],
    },
    {
      id: "printing",
      title: "PRINTING MACHINES",
      children: [
        { id: "IGK", title: "IGK" },
        { id: "DC", title: "DC" },
        { id: "NIGK", title: "NIGK" },
        { id: "RTCPL-DC", title: "RTCPL-DC" },
      ],
    },
  ];

  const events = useMemo(() => {
    if (!designs?.length) return [];

    return designs.flatMap((d) => {
      if (d.planning_status !== 2) return [];

      const events = [];

      const coating = d?.planning_work_details?.coating_machine_plan;
      if (coating?.machine && coating?.start_date && coating?.end_date) {
        events.push({
          id: `${d.saleorder_no}-Coating`,
          resourceId: coating.machine,
          title: `${d.saleorder_no} (Coating)`,
          start: coating.start_date,
          end: dayjs(coating.end_date).add(1, "day").format("YYYY-MM-DD"),
          backgroundColor: "#e53935",
          extendedProps: {
            customer: d.customer_name,
            process: "Coating",
          },
        });
      }

      const printing = d?.planning_work_details?.printing_machine_plan;
      if (printing?.machine && printing?.start_date && printing?.end_date) {
        events.push({
          id: `${d.saleorder_no}-Printing`,
          resourceId: printing.machine,
          title: `${d.saleorder_no} (Printing)`,
          start: printing.start_date,
          end: dayjs(printing.end_date).add(1, "day").format("YYYY-MM-DD"),
          backgroundColor: "#fb8c00",
          extendedProps: {
            customer: d.customer_name,
            process: "Printing",
          },
        });
      }

      return events;
    });
  }, [designs]);

  return (
    <>
      <Box className="breadcrump-con">
        <Box className="main-title">
          <div>Machine Calendar</div>
        </Box>
        <FullCalendar
          plugins={[resourceTimelinePlugin, interactionPlugin]}
          schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
          initialView="resourceTimelineDay"
          views={{
            resourceTimelineDay: { buttonText: "Day" },
            resourceTimelineWeek: { buttonText: "Week" },
            resourceTimelineMonth: { buttonText: "Month" },
          }}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right:
              "resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth",
          }}
          nowIndicator={true}
          resources={machineList}
          events={events}
          height="auto"
          resourceAreaWidth={250}
          slotMinWidth={50}
          eventMouseEnter={(info) => {
            const { customer, process } = info.event.extendedProps;

            info.el.title = `
SO : ${info.event.title}
Customer : ${customer}
Process : ${process}
From : ${dayjs(info.event.start).format("DD MMM YYYY HH:mm")}
To : ${dayjs(info.event.end).format("DD MMM YYYY HH:mm")}
`;
          }}
        />
      </Box>
    </>
  );
}

export default MachineCalendar;
