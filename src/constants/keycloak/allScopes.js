export const allScopes = [
    // Team Management/Access
    { module: "Team Management/Access", id: "b08d6394-c225-4970-b209-52c2b984f534", name: "view user" },
    { module: "Team Management/Access", id: "8e0b7437-e3c4-416e-a87d-48d45bded285", name: "create/edit user" },
    { module: "Team Management/Access", id: "d65107f7-d850-4b94-b821-c1ec02b18b65", name: "view agency(JV)" },
    { module: "Team Management/Access", id: "adb84f18-c9cc-4a7a-b9f3-2626f651ec7c", name: "create agency(JV)" },
    { module: "Team Management/Access", id: "2f145038-b370-474e-991d-a2da0f8359ff", name: "view roles" },
    { module: "Team Management/Access", id: "fbff400e-114d-4aaf-bd94-9979c5bee569", name: "create roles" },
  
    // Attendance
    { module: "Attendance", id: "861f47db-6918-4bad-bd5c-078239eb837e", name: "mark attendance" },
    { module: "Attendance", id: "0a758051-7932-419e-85eb-5de0b6ba2f2e", name: "view my report" },
    { module: "Attendance", id: "b25bab5a-e58f-4516-8681-98222b3563ba", name: "view my team report" },
    { module: "Attendance", id: "abe0647e-ec88-417a-a608-e023fc7689fb", name: "configure and approve attendance" },
    { module: "Attendance", id: "6ea85404-c907-4ef3-a463-0ea8d62322e1", name: "download report" },
  
    // UCC
    { module: "UCC", id: "50109d52-e13e-485f-aa47-63c9292d33c0", name: "view stretch" },
    { module: "UCC", id: "fa774fc3-634f-4d4b-9ec2-8c5f7ba1628b", name: "create stretch" },
    { module: "UCC", id: "aab29a22-359f-4c6e-b2d1-7242bf81837c", name: "view ucc" },
    { module: "UCC", id: "7c320850-bb00-48d5-bc9a-295c3dc55d1b", name: "create ucc" },
    { module: "UCC", id: "6be3a47e-13d1-499e-988b-010f4d550736", name: "edit ucc" },
    { module: "UCC", id: "a880c558-f874-401e-b33a-4044684259cb", name: "approve ucc/stretch" },
  
    // Road Maintenance
    { module: "Road Maintenance", id: "ae95cb5b-f8e1-4da8-bed8-690c21911e66", name: "view defect" },
    { module: "Road Maintenance", id: "60c8e462-00df-4994-beb4-2491fa950c25", name: "create defect" },
    { module: "Road Maintenance", id: "66970968-eb10-4a1c-9aa3-dcc11d2dbbb8", name: "(re)schedule joint inspection" },
    { module: "Road Maintenance", id: "7a5d52f2-76ab-4455-b625-93dfababa71b", name: "assign joint inspection" },
    { module: "Road Maintenance", id: "7918be13-2c66-4057-8fff-35e6003b68fb", name: "join- joint inspection" },
    { module: "Road Maintenance", id: "470cd22b-34a9-4e04-b62f-15c64e451460", name: "add defect in Joint Inspection" },
    { module: "Road Maintenance", id: "649bb803-52b1-4e75-9362-4ac998e7bf0e", name: "submit atr" },
    { module: "Road Maintenance", id: "1fbfb38d-5394-4896-b8bd-ddbef7269c61", name: "review atr" },
    { module: "Road Maintenance", id: "bd8c2630-182b-4e9e-a00b-723d5b4e4a7a", name: "submit eot" },
    { module: "Road Maintenance", id: "b4e72767-f8f9-4da2-b9b7-c36f24ca003d", name: "review eot" },
  
    // RFI
    { module: "RFI", id: "ba007766-cb7c-4518-85cc-56544dd11de4", name: "schedule RFI" },
    { module: "RFI", id: "a1e66364-a625-4361-a8c8-45ccf2a2088b", name: "assign RFI" },
    { module: "RFI", id: "4622d948-a709-42a0-a152-419af2f06c23", name: "view RFI" },
    { module: "RFI", id: "ec3713b2-8c58-406b-beb6-1392f1fc7d37", name: "submit inspection report" },
    { module: "RFI", id: "671c0a55-e298-43cb-9100-a7916cf6e522", name: "submit lab report" },
    { module: "RFI", id: "89b66c43-3c47-4c56-8445-30222c2dcc7d", name: "validate lab report" },
    { module: "RFI", id: "17fc14dc-b13e-4e5f-bfbe-8a685a7719b1", name: "review rfi" },
  
    // Road Safety Audit
    { module: "Road Safety Audit", id: "518f85f6-696f-44a0-ba64-e32abca434d1", name: "schedule audit" },
    { module: "Road Safety Audit", id: "1c7553a9-14db-4c5e-b096-6248dcf4315c", name: "assign audit" },
    { module: "Road Safety Audit", id: "d7fdf026-f9a9-44ba-a363-f8b179da0077", name: "start audit" },
    { module: "Road Safety Audit", id: "832709f8-1b54-40d0-a8eb-a79ccd0119c9", name: "submit observations to audit" },
    { module: "Road Safety Audit", id: "ba3bbd64-450f-4485-81e9-6fa501a111c3", name: "forward observation" },
    { module: "Road Safety Audit", id: "dca10a7c-0d1e-4329-a6da-dc4c0000f7fb", name: "validate observation" },
    { module: "Road Safety Audit", id: "c12f98c6-afe4-4cb4-b9ca-7768c9832a82", name: "submit compliance report" },
    { module: "Road Safety Audit", id: "4022f8a0-a5ba-4e81-8d03-070bccbe1609", name: "verify compliance report" },
    { module: "Road Safety Audit", id: "1100ef1e-d48e-4227-b810-5801c501e061", name: "resolve observation" },
  
    // Toilet Maintenance
    { module: "Toilet Maintenance", id: "adad16aa-8282-4e9f-8f2e-d6d09e398ec4", name: "view toll plaza inventory" },
    { module: "Toilet Maintenance", id: "4272161d-1cf8-4aa4-9550-ed542587e935", name: "create toll plaza toilets inventory" },
    { module: "Toilet Maintenance", id: "b4f6b130-1a85-4624-a02e-630f7627ef98", name: "submit toilet inspection report" },
    { module: "Toilet Maintenance", id: "9edb9222-0b56-469e-817d-248e7938ec03", name: "view toilet inspection report" },
  
    // Helpdesk
    { module: "Helpdesk", id: "dddb9329-5ea0-4ec3-bc87-d6daac07db33", name: "create ticket" },
    { module: "Helpdesk", id: "a6b48488-9cd8-49b3-998f-549ce5634fc9", name: "chat with bot" },
    { module: "Helpdesk", id: "2552b825-4c46-4bad-b31a-565691c94c36", name: "view all tickets" },
  
    // Landing Page
    { module: "Landing Page", id: "540d3558-ce7c-4d26-b8b0-3bc818386e45", name: "hq widget" }
  ];