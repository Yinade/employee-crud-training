// import { FC, useMemo } from "react";
// import { Link } from "react-router-dom";

// type NotificationGroup = {
//   key: string;
//   title: string;
//   count: number;
//   icon: string;
//   colorClass: "danger" | "warning" | "primary" | "success" | "info";
//   preview: string;
//   link: string;
// };

// const shortText = (value?: string | null, max = 75) => {
//   if (!value) return "No preview available";
//   return value.length > max ? `${value.slice(0, max)}...` : value;
// };

// const HeaderNotificationCenter: FC<Props> = ({
//   assignedToMeRemarks,
//   otherRemarks,
//   expiredInvoiceCount = 0,
//   onRequestCloseMenu,
//   cancellations = [],
//   onCancellationClick,
// }) => {
//   const totalRemarkCount = assignedToMeRemarks.length + otherRemarks.length;

//   const latestRemark = useMemo(() => {
//     return [...assignedToMeRemarks, ...otherRemarks].sort((a, b) => {
//       const da = new Date(a.createdAt ?? "").getTime();
//       const db = new Date(b.createdAt ?? "").getTime();
//       return db - da;
//     })[0];
//   }, [assignedToMeRemarks, otherRemarks]);

//   const groups: NotificationGroup[] = [
//     {
//       key: "remarks",
//       title: "Remarks",
//       count: totalRemarkCount,
//       icon: "bi-chat-left-text",
//       colorClass: "danger",
//       preview: latestRemark
//         ? shortText(latestRemark.body)
//         : "No open remark notifications",
//       link: "/remarks/notifications/mine",
//     },
//     {
//       key: "expired-invoices",
//       title: "Expired Invoices",
//       count: expiredInvoiceCount,
//       icon: "bi-receipt",
//       colorClass: "warning",
//       preview:
//         expiredInvoiceCount > 0
//           ? "Some invoices have passed their due date"
//           : "No expired invoices",
//       link: "/invoices/list",
//     },
//   ];

//   const activeGroups = groups.filter((group) => group.count > 0);
//   const totalCount = groups.reduce((sum, group) => sum + group.count, 0) + cancellations.length;

//   return (
//     <div
//       className="
//         menu menu-sub menu-sub-dropdown menu-column menu-rounded
//         menu-gray-700 menu-state-bg menu-state-primary fw-semibold
//         py-4 fs-6 w-400px show
//       "
//       style={{
//         position: "absolute",
//         right: 0,
//         top: "calc(100% + 0.75rem)",
//         zIndex: 100,
//       }}
//     >
//       <div className="px-6 pb-3">
//         <div className="d-flex align-items-center justify-content-between">
//           <span className="fw-bold fs-4">Notifications</span>

//           {totalCount > 0 && (
//             <span className="badge badge-danger">
//               {totalCount > 99 ? "99+" : totalCount}
//             </span>
//           )}
//         </div>

//         <div className="text-muted fs-8 mt-1">System alerts and reminders</div>
//       </div>

//       <div className="separator my-2" />

//       <div style={{ maxHeight: 390, overflowY: "auto" }}>
//         {activeGroups.length === 0 && cancellations.length === 0 && (
//           <div className="px-6 py-6 text-center">
//             <div className="text-muted fs-6">No active notifications</div>
//           </div>
//         )}

//         {activeGroups.map((group) => (
//           <Link
//             key={group.key}
//             to={group.link}
//             className="d-flex align-items-start px-6 py-4 text-decoration-none text-gray-800 text-hover-primary"
//             onClick={onRequestCloseMenu}
//           >
//             <div className="symbol symbol-40px me-4">
//               <span
//                 className={`symbol-label bg-light-${group.colorClass} text-${group.colorClass}`}
//               >
//                 <i className={`bi ${group.icon} fs-4`}></i>
//               </span>
//             </div>

//             <div className="flex-grow-1">
//               <div className="d-flex align-items-center justify-content-between gap-3">
//                 <span className="fw-bold fs-6">{group.title}</span>

//                 <span className={`badge badge-light-${group.colorClass}`}>
//                   {group.count > 99 ? "99+" : group.count}
//                 </span>
//               </div>

//               <div className="text-muted fs-8 mt-1">{group.preview}</div>

//               <div className="text-primary fs-8 mt-2">View details</div>
//             </div>
//           </Link>
//         ))}

//       </div>

//       <div className="separator my-2" />

//       <div className="px-6 pt-2">
//         <Link
//           to="/remarks/notifications/mine"
//           className="btn btn-sm btn-light-primary w-100"
//           onClick={onRequestCloseMenu}
//         >
//           View All Notifications
//         </Link>
//       </div>
//     </div>
//   );
// };

// export { HeaderNotificationCenter };
