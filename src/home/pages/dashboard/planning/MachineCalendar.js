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
        {
          id: "Machine 1",
          title: "Machine 1",
          eventColor: "#1e88e5",
          labelColor: "#1e88e5",
        },
        {
          id: "Machine 2",
          title: "Machine 2",
          eventColor: "#43a047",
          labelColor: "#43a047",
        },
        {
          id: "Machine 3",
          title: "Machine 3",
          eventColor: "#8e24aa",
          labelColor: "#8e24aa",
        },
      ],
    },
    {
      id: "printing",
      title: "PRINTING MACHINES",
      children: [
        {
          id: "IGK",
          title: "IGK",
          eventColor: "#fb8c00",
          labelColor: "#fb8c00",
        },
        {
          id: "DC",
          title: "DC",
          eventColor: "#e53935",
          labelColor: "#e53935",
        },
        {
          id: "NIGK",
          title: "NIGK",
          eventColor: "#3949ab",
          labelColor: "#3949ab",
        },
        {
          id: "RTCPL-DC",
          title: "RTCPL-DC",
          eventColor: "#00897b",
          labelColor: "#00897b",
        },
      ],
    },
  ];

  const events = useMemo(() => {
    if (!designs?.length) return [];

    return designs.flatMap((d) => {
      if (d.planning_status !== 2) return [];

      const events = [];

      const coating = d?.planning_work_details?.coating_machine_plan;

      if (coating?.bookings?.length) {
        coating.bookings.forEach((b, index) => {
          events.push({
            id: `${d.saleorder_no}-Coating-${index}`,
            resourceId: b.machine,
            title: `${d.saleorder_no} (Coating)`,
            start: b.shift_from_dt,
            end: b.shift_to_dt,
            extendedProps: {
              customer: d.customer_name,
              process: "Coating",
            },
          });
        });
      }

      const printing = d?.planning_work_details?.printing_machine_plan;

      if (printing?.bookings?.length) {
        printing.bookings.forEach((b, index) => {
          events.push({
            id: `${d.saleorder_no}-Printing-${index}`,
            resourceId: b.machine,
            title: `${d.saleorder_no} (Printing)`,
            start: b.shift_from_dt,
            end: b.shift_to_dt,
            extendedProps: {
              customer: d.customer_name,
              process: "Printing",
            },
          });
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
          resourceAreaWidth={250}
          slotMinWidth={50}
          resourceLabelDidMount={(info) => {
            const color = info.resource.extendedProps.labelColor;

            if (color) {
              info.el.style.color = color;
            }
          }}
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
