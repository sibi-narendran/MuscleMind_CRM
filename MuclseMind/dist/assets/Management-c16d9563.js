import{r as d,aa as O,m as o,j as e,S as j,ab as B,ac as F}from"./index-1369e829.js";import{h as c,D as V}from"./moment-615d8e86.js";import{M as y,I,E as $}from"./index-ac99bac4.js";import{U as R}from"./users-40beb7c7.js";import{C as J}from"./clock-3c8cf9d4.js";import{C as b}from"./calendar-e01d981a.js";import{D as L}from"./dollar-sign-8112f778.js";import"./roundedArrow-db736918.js";import"./createLucideIcon-c2fbbefa.js";const U=({isVisible:a,onClose:m,dentalTeamId:s})=>{const[i,x]=d.useState([]);d.useEffect(()=>{console.log("Modal visibility:",a,"Dental Team ID:",s),s&&a&&h(s)},[s,a]);const h=async r=>{try{const l=await O(r);l.success?x(l.data):o.error("Failed to fetch attendance data")}catch(l){console.error("Error fetching attendance data:",l),o.error("Error fetching attendance data")}};return e.jsx(y,{title:`Attendance Details for Dental Team ID: ${s}`,visible:a,onCancel:m,footer:null,children:e.jsx("div",{style:{padding:"20px"},children:i.length>0?e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{borderBottom:"2px solid #ccc",padding:"10px",textAlign:"left"},children:"Date"}),e.jsx("th",{style:{borderBottom:"2px solid #ccc",padding:"10px",textAlign:"left"},children:"Name"}),e.jsx("th",{style:{borderBottom:"2px solid #ccc",padding:"10px",textAlign:"center"},children:"Attendance Status"})]})}),e.jsx("tbody",{children:i.map((r,l)=>e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"10px",borderBottom:"1px solid #eee"},children:c(r.date).format("MMMM Do YYYY")}),e.jsx("td",{style:{padding:"10px",borderBottom:"1px solid #eee"},children:r.name}),e.jsx("td",{style:{padding:"10px",borderBottom:"1px solid #eee",textAlign:"center"},children:r.attendance_status})]},l))})]}):e.jsx("p",{children:"No attendance records found."})})})},{Option:p}=j,ee=()=>{const[a,m]=d.useState([]),[s,i]=d.useState(c().format("YYYY-MM-DD")),[x,h]=d.useState(""),[r,l]=d.useState(null);d.useState(!1),d.useState(null),d.useState([]);const[k,f]=d.useState(!1),[w,N]=d.useState(null),v=(t,n)=>{i(n)},D=t=>{h(t.target.value)};a.filter(t=>t.name.toLowerCase().includes(x.toLowerCase()));const S=a.filter(t=>t.attendance_status==="Present").length,A=a.filter(t=>t.attendance_status==="Absent").length,M=a.filter(t=>t.attendance_status==="Day Off").length,C=a.reduce((t,n)=>t+parseFloat(n.salary),0).toFixed(2),Y=t=>{l(t)},E=async(t,n)=>{const g=await B(t,n);g.success?(o.success("Attendance status updated successfully."),u()):(console.error("Error updating attendance status:",g.error),o.error("Failed to update attendance status"))},P=t=>{switch(t){case"Present":return"px-2 py-1 text-xs font-medium rounded-full text-meta-3 bg-meta-4 dark:bg-green-900";case"Day Off":return"px-2 py-1 text-xs font-medium rounded-full text-meta-6 bg-meta-4 dark:bg-yellow-900";case"Absent":return"px-2 py-1 text-xs font-medium rounded-full text-meta-1 bg-meta-4 dark:bg-red-900";default:return"px-2 py-1 text-xs font-medium rounded-full"}},u=async()=>{const t=await F(s);t.success?m(t.data):(console.error("Error fetching staff:",t.error),o.error("Failed to fetch staff data"))},T=t=>{console.log("View button clicked, Dental Team ID:",t),N(t),f(!0)},_=()=>{f(!1)};return d.useEffect(()=>{u()},[s]),e.jsxs("div",{className:"p-6 dark:bg-boxdark",children:[e.jsx("div",{className:"flex flex-col lg:flex-row justify-between items-center mb-6",children:e.jsx("h2",{className:"text-2xl font-bold text-center lg:text-left",children:s===c().format("YYYY-MM-DD")?"Today's Attendances":`Attendances for ${s}`})}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6",children:[e.jsx("div",{className:"bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500 dark:text-meta-2",children:"Total Staff"}),e.jsx("h3",{className:"text-2xl font-bold text-gray-900 dark:text-white mt-1",children:a.length})]}),e.jsx(R,{className:"h-8 w-8 text-blue-500 dark:text-meta-3"})]})}),e.jsx("div",{className:"bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500 dark:text-meta-2",children:"Present Today"}),e.jsx("h3",{className:"text-2xl font-bold text-gray-900 dark:text-white mt-1",children:S})]}),e.jsx(J,{className:"h-8 w-8 text-green-500 dark:text-meta-3"})]})}),e.jsx("div",{className:"bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500 dark:text-meta-2",children:"Absent Today"}),e.jsx("h3",{className:"text-2xl font-bold text-gray-900 dark:text-white mt-1",children:A})]}),e.jsx(b,{className:"h-8 w-8 text-red-500 dark:text-meta-3"})]})}),e.jsx("div",{className:"bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500 dark:text-meta-2",children:"Day Off Staff"}),e.jsx("h3",{className:"text-2xl font-bold text-gray-900 dark:text-white mt-1",children:M})]}),e.jsx(b,{className:"h-8 w-8 text-yellow-500 dark:text-meta-3"})]})}),e.jsx("div",{className:"bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex flex-col",children:[e.jsx("p",{className:"text-sm text-gray-500 dark:text-meta-2",children:"Total Payroll"}),e.jsxs("h3",{className:"text-2xl font-bold text-gray-900 dark:text-white mt-1",children:["$",C]})]}),e.jsx(L,{className:"h-8 w-8 text-yellow-500 dark:text-meta-3"})]})})]}),e.jsx("div",{className:"grid grid-cols-1 gap-6 w-full",children:e.jsx("div",{children:e.jsxs("div",{className:"bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark",children:[e.jsxs("div",{className:"p-6 border-b border-gray-200 dark:border-strokedark flex flex-col sm:flex-row items-center justify-between",children:[e.jsx("h2",{className:"text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0",children:s===c().format("YYYY-MM-DD")?"Today's Attendances":`Attendances for ${s}`}),e.jsxs("div",{className:"flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4",children:[e.jsx(I,{placeholder:"Search by name",value:x,onChange:D}),e.jsx(V,{onChange:v,format:"YYYY-MM-DD"})]})]}),e.jsx("div",{className:"overflow-x-auto w-full",children:e.jsxs("table",{className:"min-w-full divide-y divide-gray-200 dark:divide-strokedark",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-50 dark:bg-strokedark",children:[e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider",children:"Date"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider",children:"Name"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider",children:"Role"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider",children:"Date of Joining"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider",children:"Salary"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider",children:"Status"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider",children:"Action"})]})}),e.jsx("tbody",{className:"bg-white dark:bg-boxdark divide-y divide-gray-200 dark:divide-strokedark",children:a.length>0?a.map(t=>e.jsxs("tr",{className:"hover:bg-gray-50 dark:hover:bg-meta-4",onClick:()=>Y(t),children:[e.jsx("td",{className:"px-6 py-4 whitespace-nowrap","data-label":"Date :",children:c(t.date).format("YYYY-MM-DD")}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap","data-label":"Name :",children:t.name}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap","data-label":"Role :",children:t.role}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap","data-label":"Date of Joining :",children:t.doj}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap","data-label":"Salary :",children:t.salary}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap","data-label":"Status :",children:e.jsx("button",{className:P(t.attendance_status),children:t.attendance_status||"Pending"})}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap","data-label":"Action :",children:e.jsxs("button",{onClick:n=>{n.stopPropagation(),T(t.dental_team_id)},className:"bg-blue-500 text-white rounded px-2 py-1 flex items-center",children:[e.jsx($,{style:{color:"white"}}),e.jsx("span",{className:"ml-1",children:"View"})]})})]},t.id)):e.jsx("tr",{children:e.jsx("td",{colSpan:"6",className:"text-center py-4",children:"No data available"})})})]})})]})})}),r&&e.jsx(y,{title:e.jsx("div",{style:{textAlign:"center",fontWeight:"bold"},children:r.name}),visible:!!r,onCancel:()=>l(null),footer:null,children:e.jsxs("div",{className:"flex flex-col items-center font-bold",children:[e.jsx("p",{children:r.role}),e.jsxs("div",{className:"flex justify-between w-full px-4",children:[e.jsx("span",{children:"Attendance Status:"}),e.jsxs(j,{defaultValue:r.attendance_status,style:{width:120},onChange:t=>E(r.id,t),children:[e.jsx(p,{value:"Present",className:"text-meta-3",children:"Present"}),e.jsx(p,{value:"Day Off",className:"text-meta-6",children:"Day Off"}),e.jsx(p,{value:"Absent",className:"text-meta-1",children:"Absent"})]})]})]})}),e.jsx(U,{dentalTeamId:w,isVisible:k,onClose:_})]})};export{ee as default};
