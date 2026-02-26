import { useState, useMemo } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Button, Dialog,
  DialogContent, DialogActions, TextField, IconButton, Snackbar,
  Alert, Stack, InputAdornment, Divider, Chip, MenuItem,
  Select, FormControl, InputLabel, Tab, Tabs, Tooltip,
} from "@mui/material";
import {
  Add, Delete, Search, Close, FilterList, CheckCircle,
  Cancel, Schedule, Visibility, MedicalServices,
  TransferWithinAStation, AccessTime, Coronavirus,
  ArrowForward, Lock, Warning,
} from "@mui/icons-material";

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  primary: "#1a233a",
  bg:      "#f8f9fa",
  inputBg: "#f4f7f9",
  shadow:  "0 4px 20px rgba(0,0,0,0.08)",
};

// ─────────────────────────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────────────────────────
const STATUS = {
  reported:  { label: "Reported",  color: "#ffb347", bg: "rgba(255,179,71,0.12)",  border: "rgba(255,179,71,0.3)",  icon: <Schedule      sx={{ fontSize: 13 }} />, step: 0 },
  confirmed: { label: "Confirmed", color: "#4fc3f7", bg: "rgba(79,195,247,0.12)",  border: "rgba(79,195,247,0.3)",  icon: <CheckCircle   sx={{ fontSize: 13 }} />, step: 1 },
  treating:  { label: "Treating",  color: "#9c8fff", bg: "rgba(156,143,255,0.12)", border: "rgba(156,143,255,0.3)", icon: <MedicalServices sx={{ fontSize: 13 }} />, step: 2 },
  referred:  { label: "Referred",  color: "#4fc3f7", bg: "rgba(79,195,247,0.12)",  border: "rgba(79,195,247,0.3)",  icon: <TransferWithinAStation sx={{ fontSize: 13 }} />, step: 2 },
  recovered: { label: "Recovered", color: "#00d4aa", bg: "rgba(0,212,170,0.12)",   border: "rgba(0,212,170,0.3)",   icon: <CheckCircle   sx={{ fontSize: 13 }} />, step: 3 },
  death:     { label: "Death",     color: "#ff6b6b", bg: "rgba(255,107,107,0.12)", border: "rgba(255,107,107,0.3)", icon: <Cancel        sx={{ fontSize: 13 }} />, step: 3 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Valid forward transitions  (from → allowed tos)
// Closed statuses (recovered / death) cannot transition to anything
// ─────────────────────────────────────────────────────────────────────────────
const ALLOWED_TRANSITIONS = {
  reported:  ["confirmed"],
  confirmed: ["treating", "referred", "death"],
  treating:  ["recovered", "referred", "death"],
  referred:  ["treating", "recovered", "death"],
  recovered: [],   // CLOSED — no further changes
  death:     [],   // CLOSED — no further changes
};

// Human-readable reason why a transition is blocked
function transitionBlockReason(from, to) {
  if (from === "recovered" || from === "death")
    return `Case is already closed (${STATUS[from]?.label}). Closed cases cannot be changed.`;
  if (!ALLOWED_TRANSITIONS[from]?.includes(to))
    return `Cannot move from "${STATUS[from]?.label}" → "${STATUS[to]?.label}". Follow the correct workflow.`;
  return null;
}

const SNAKE_TYPES = ["Cobra","Krait","Russell's Viper","Saw-scaled Viper","King Cobra","Unknown","Other"];
const BODY_PARTS  = ["Hand","Foot","Leg","Arm","Torso","Neck","Face","Unknown"];
const DISTRICTS   = ["Colombo","Kandy","Galle","Matara","Kurunegala","Ratnapura","Anuradhapura","Badulla","Ampara","Trincomalee"];
const HOSPITALS   = ["Central Hospital","Eastern Medical Center","Western Clinic","Northern Health Center","General Hospital Colombo"];

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_CASES = [
  {
    id:"SBC-001", patient_name:"Ravi Kumar", age:34, gender:"Male",
    phone:"+94 77 111 2233", address:"12 Paddy Field Rd, Colombo",
    district:"Colombo", snake_type:"Cobra", bite_location:"Hand",
    bite_time:"2024-06-10T08:30", reported_at:"2024-06-10T08:45",
    status:"recovered", chw_name:"Dilani Jayawardena", hospital:"Central Hospital",
    asv_given:true, asv_vials:4, symptoms:"Swelling, nausea, blurred vision",
    notes:"Patient responded well to ASV. Discharged after 48hrs.",
    timeline:[
      {time:"08:45", action:"Case reported by community",       by:"Community App"},
      {time:"09:00", action:"CHW notified & dispatched",        by:"System"},
      {time:"09:20", action:"CHW confirmed bite — Cobra",       by:"Dilani Jayawardena"},
      {time:"10:05", action:"Admitted to Central Hospital",     by:"Dr. Perera"},
      {time:"10:30", action:"4 vials ASV administered",         by:"Dr. Perera"},
      {time:"2024-06-12 09:00", action:"Patient recovered & discharged", by:"Dr. Perera"},
    ],
  },
  {
    id:"SBC-002", patient_name:"Nimasha Perera", age:22, gender:"Female",
    phone:"+94 76 222 3344", address:"45 Tea Estate, Kandy",
    district:"Kandy", snake_type:"Krait", bite_location:"Foot",
    bite_time:"2024-06-12T22:15", reported_at:"2024-06-12T22:30",
    status:"treating", chw_name:"Kasun Bandara", hospital:"Eastern Medical Center",
    asv_given:true, asv_vials:6, symptoms:"Paralysis of limbs, drooping eyelids",
    notes:"Critical — ICU admission. Krait envenomation.",
    timeline:[
      {time:"22:30", action:"Case reported",                    by:"Community App"},
      {time:"22:45", action:"CHW notified",                     by:"System"},
      {time:"23:10", action:"CHW confirmed — Krait bite",       by:"Kasun Bandara"},
      {time:"23:55", action:"Transferred to Eastern Medical",   by:"Ambulance"},
      {time:"00:20", action:"6 vials ASV + ICU admission",      by:"Dr. Silva"},
    ],
  },
  {
    id:"SBC-003", patient_name:"Sunil Fernando", age:55, gender:"Male",
    phone:"+94 75 333 4455", address:"78 River Bank, Matara",
    district:"Matara", snake_type:"Russell's Viper", bite_location:"Leg",
    bite_time:"2024-06-14T14:00", reported_at:"2024-06-14T14:10",
    status:"referred", chw_name:"Saman Weerasinghe", hospital:"Western Clinic",
    asv_given:false, asv_vials:0, symptoms:"Severe bleeding, kidney pain",
    notes:"Referred to Colombo General — Western Clinic ASV stock empty.",
    timeline:[
      {time:"14:10", action:"Case reported",                      by:"Community App"},
      {time:"14:25", action:"CHW confirmed — Russell's Viper",    by:"Saman Weerasinghe"},
      {time:"15:00", action:"Western Clinic — no ASV, referred",  by:"Dr. Rathnayake"},
      {time:"15:45", action:"En route to General Hospital",       by:"Ambulance"},
    ],
  },
  {
    id:"SBC-004", patient_name:"Ayesha Nawaz", age:18, gender:"Female",
    phone:"+94 71 444 5566", address:"23 Paddy Rd, Ampara",
    district:"Ampara", snake_type:"Unknown", bite_location:"Arm",
    bite_time:"2024-06-15T07:00", reported_at:"2024-06-15T07:05",
    status:"reported", chw_name:null, hospital:null,
    asv_given:false, asv_vials:0, symptoms:"Pain, mild swelling",
    notes:"Awaiting CHW response.",
    timeline:[{time:"07:05", action:"Case reported by community", by:"Community App"}],
  },
  {
    id:"SBC-005", patient_name:"Bandula Rathnayake", age:67, gender:"Male",
    phone:"+94 70 555 6677", address:"12 Farm Lane, Kurunegala",
    district:"Kurunegala", snake_type:"Saw-scaled Viper", bite_location:"Hand",
    bite_time:"2024-06-08T05:30", reported_at:"2024-06-08T05:45",
    status:"death", chw_name:"Priyanka Dissanayake", hospital:"Northern Health Center",
    asv_given:true, asv_vials:8, symptoms:"Severe coagulopathy, organ failure",
    notes:"Patient passed away 18hrs after bite despite treatment.",
    timeline:[
      {time:"05:45", action:"Case reported",                         by:"Community App"},
      {time:"06:00", action:"CHW dispatched",                        by:"System"},
      {time:"06:30", action:"CHW confirmed — Saw-scaled Viper",      by:"Priyanka Dissanayake"},
      {time:"07:15", action:"8 vials ASV administered",              by:"Dr. Kumara"},
      {time:"2024-06-09 00:10", action:"Patient deceased",           by:"Dr. Kumara"},
    ],
  },
  {
    id:"SBC-006", patient_name:"Lasanthi Silva", age:29, gender:"Female",
    phone:"+94 72 666 7788", address:"56 Garden Rd, Galle",
    district:"Galle", snake_type:"Cobra", bite_location:"Foot",
    bite_time:"2024-06-16T11:20", reported_at:"2024-06-16T11:25",
    status:"confirmed", chw_name:"Thilak Jayasuriya", hospital:null,
    asv_given:false, asv_vials:0, symptoms:"Local necrosis, pain",
    notes:"CHW on site. Awaiting hospital admission.",
    timeline:[
      {time:"11:25", action:"Case reported",              by:"Community App"},
      {time:"11:35", action:"CHW confirmed — Cobra bite", by:"Thilak Jayasuriya"},
    ],
  },
];

const emptyForm = {
  patient_name:"", age:"", gender:"Male", phone:"", address:"",
  district:"", snake_type:"Unknown", bite_location:"Hand",
  bite_time:"", symptoms:"", notes:"", hospital:"",
};

// ─────────────────────────────────────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status, size = "small" }) {
  const cfg = STATUS[status] || STATUS.reported;
  return (
    <Chip
      icon={<Box sx={{ color:`${cfg.color} !important`, display:"flex", ml:"6px !important" }}>{cfg.icon}</Box>}
      label={cfg.label} size={size}
      sx={{
        fontWeight:700, fontSize: size==="small" ? "0.68rem" : "0.78rem",
        height: size==="small" ? 22 : 28,
        background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`,
        flexShrink: 0,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow stepper — visual progress bar inside detail dialog
// reported → confirmed → treating/referred → recovered/death
// ─────────────────────────────────────────────────────────────────────────────
const WORKFLOW_STEPS = ["Reported","Confirmed","Treating","Outcome"];
function WorkflowStepper({ status }) {
  const step = STATUS[status]?.step ?? 0;
  const isDeath = status === "death";
  return (
    <Box sx={{ display:"flex", alignItems:"center", gap:0, mb:2.5 }}>
      {WORKFLOW_STEPS.map((label, i) => {
        const done    = i < step;
        const current = i === step;
        const isLast  = i === WORKFLOW_STEPS.length - 1;
        const color   = current
          ? (isDeath && isLast ? "#ff6b6b" : STATUS[status]?.color || "#9c8fff")
          : done ? "#00d4aa" : "#e0e0e0";
        return (
          <Box key={label} sx={{ display:"flex", alignItems:"center", flex: isLast ? 0 : 1 }}>
            <Box sx={{ display:"flex", flexDirection:"column", alignItems:"center", gap:0.5 }}>
              <Box sx={{
                width:28, height:28, borderRadius:"50%", display:"flex",
                alignItems:"center", justifyContent:"center",
                bgcolor: done||current ? color : "#f0f0f0",
                border: `2px solid ${color}`,
                transition:"all 0.3s",
              }}>
                {done
                  ? <CheckCircle sx={{ fontSize:14, color:"#fff" }} />
                  : current && isDeath && isLast
                    ? <Cancel sx={{ fontSize:14, color:"#fff" }} />
                    : <Typography sx={{ fontSize:"0.62rem", fontWeight:800, color: done||current?"#fff":"#bbb" }}>{i+1}</Typography>
                }
              </Box>
              <Typography sx={{ fontSize:"0.58rem", fontWeight:700, color, whiteSpace:"nowrap" }}>{label}</Typography>
            </Box>
            {!isLast && (
              <Box sx={{ flex:1, height:2, bgcolor: done ? "#00d4aa" : "#e0e0e0", mx:0.5, mb:2, transition:"all 0.3s" }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Note types
// ─────────────────────────────────────────────────────────────────────────────
const NOTE_TYPES = [
  { value:"observation", label:"Observation",    color:"#9c8fff", emoji:"👁️" },
  { value:"medication",  label:"Medication",     color:"#00d4aa", emoji:"💊" },
  { value:"referral",    label:"Referral",       color:"#4fc3f7", emoji:"🚑" },
  { value:"family",      label:"Family Contact", color:"#ffb347", emoji:"📞" },
  { value:"vitals",      label:"Vitals",         color:"#ff6b6b", emoji:"❤️" },
  { value:"general",     label:"Note",           color:"#8892a4", emoji:"📝" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Case Detail Dialog  — fixed responsive layout, scrollable panels
// ─────────────────────────────────────────────────────────────────────────────
function CaseDetailDialog({ caseData, open, onClose, onStatusChange, onAddNote }) {
  const [newStatus,   setNewStatus]   = useState("");
  const [statusNote,  setStatusNote]  = useState("");
  const [statusError, setStatusError] = useState("");
  const [noteText,    setNoteText]    = useState("");
  const [noteType,    setNoteType]    = useState("general");
  const [noteBy,      setNoteBy]      = useState("Admin");
  const [noteAdded,   setNoteAdded]   = useState(false);

  // Reset local state when a new case is opened
  const [lastId, setLastId] = useState(null);
  if (caseData && caseData.id !== lastId) {
    setLastId(caseData.id);
    setNewStatus(caseData.status);
    setStatusNote("");
    setStatusError("");
  }

  if (!caseData) return null;

  const isClosed = ["recovered","death"].includes(caseData.status);
  const allowedTargets = ALLOWED_TRANSITIONS[caseData.status] || [];

  const handleStatusUpdate = () => {
    if (newStatus === caseData.status) { setStatusError("Please select a different status."); return; }
    const reason = transitionBlockReason(caseData.status, newStatus);
    if (reason) { setStatusError(reason); return; }
    setStatusError("");
    onStatusChange(caseData.id, newStatus, statusNote);
    setStatusNote("");
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    const tc = NOTE_TYPES.find(n => n.value === noteType) || NOTE_TYPES[5];
    onAddNote(caseData.id, {
      time:   new Date().toLocaleTimeString("en-GB", {hour:"2-digit", minute:"2-digit"}),
      action: `${tc.emoji} [${tc.label}] ${noteText.trim()}`,
      by:     noteBy.trim() || "Admin",
      type:   noteType,
    });
    setNoteText("");
    setNoteAdded(true);
    setTimeout(() => setNoteAdded(false), 2000);
  };

  const curNoteCfg = NOTE_TYPES.find(n => n.value === noteType) || NOTE_TYPES[5];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx:{ borderRadius:"16px", overflow:"hidden", m:{xs:1, sm:2}, width:"100%" } }}>

      {/* ── Header ── */}
      <Box sx={{ bgcolor:T.primary, px:{xs:2,sm:3}, py:2.5, flexShrink:0 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ width:40, height:40, borderRadius:"10px", bgcolor:"rgba(255,255,255,0.1)",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Coronavirus sx={{ color:"#ff6b6b", fontSize:22 }} />
          </Box>
          <Box sx={{ flex:1, minWidth:0 }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography fontWeight={800} sx={{ color:"#fff", fontSize:{xs:"0.95rem",sm:"1.1rem"} }} noWrap>
                {caseData.patient_name}
              </Typography>
              <StatusBadge status={caseData.status} />
              {isClosed && (
                <Chip icon={<Lock sx={{fontSize:"11px !important"}}/>} label="Closed"
                  size="small" sx={{ height:20, fontSize:"0.6rem", fontWeight:700,
                    bgcolor:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.6)" }} />
              )}
            </Stack>
            <Typography variant="caption" sx={{ color:"rgba(255,255,255,0.4)", fontSize:"0.7rem" }}>
              {caseData.id} · {caseData.reported_at?.split("T")[0]} · {caseData.timeline?.length||0} entries
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}
            sx={{ color:"rgba(255,255,255,0.5)", "&:hover":{color:"#fff"}, flexShrink:0 }}>
            <Close />
          </IconButton>
        </Stack>
      </Box>

      {/* ── Body: two columns, each independently scrollable ── */}
      <DialogContent sx={{ p:0, bgcolor:T.bg, overflow:"hidden" }}>
        <Grid container sx={{ height:{md:"70vh"} }}>

          {/* LEFT — patient info + status update */}
          <Grid item xs={12} md={7} sx={{
            overflowY:"auto", height:{xs:"auto", md:"70vh"},
            p:{xs:2, sm:3},
            borderRight:{md:"1px solid #eee"},
            borderBottom:{xs:"1px solid #eee", md:"none"},
            "&::-webkit-scrollbar":{width:4},
            "&::-webkit-scrollbar-thumb":{background:"#e0e0e0", borderRadius:4},
          }}>

            {/* Workflow stepper */}
            <WorkflowStepper status={caseData.status} />

            {/* Patient info */}
            <SectionLabel>Patient Information</SectionLabel>
            <InfoCard>
              <Grid container spacing={1.5}>
                {[
                  {label:"Age / Gender", value:`${caseData.age} yrs · ${caseData.gender}`},
                  {label:"Phone",        value:caseData.phone},
                  {label:"District",     value:caseData.district},
                  {label:"Address",      value:caseData.address},
                ].map(f => (
                  <Grid item xs={6} key={f.label}>
                    <FieldLabel>{f.label}</FieldLabel>
                    <Typography variant="body2" fontWeight={600} sx={{ color:T.primary, fontSize:"0.82rem" }}>{f.value||"—"}</Typography>
                  </Grid>
                ))}
              </Grid>
            </InfoCard>

            {/* Bite details */}
            <SectionLabel>Bite Details</SectionLabel>
            <InfoCard>
              <Grid container spacing={1.5}>
                {[
                  {label:"Snake",    value:caseData.snake_type,    color:"#ff6b6b"},
                  {label:"Bite Site",value:caseData.bite_location},
                  {label:"Bite Time",value:caseData.bite_time?.replace("T"," ")},
                  {label:"CHW",      value:caseData.chw_name||"Not assigned"},
                  {label:"Hospital", value:caseData.hospital||"Not admitted"},
                  {label:"ASV",      value:caseData.asv_given?`✓ ${caseData.asv_vials} vials`:"Not given",
                   color:caseData.asv_given?"#00d4aa":"#ff6b6b"},
                ].map(f => (
                  <Grid item xs={6} key={f.label}>
                    <FieldLabel>{f.label}</FieldLabel>
                    <Typography variant="body2" fontWeight={700} sx={{ color:f.color||T.primary, fontSize:"0.82rem" }}>{f.value||"—"}</Typography>
                  </Grid>
                ))}
              </Grid>
              {caseData.symptoms && (
                <Box sx={{ mt:1.5, pt:1.5, borderTop:"1px dashed #eee" }}>
                  <FieldLabel>Symptoms</FieldLabel>
                  <Typography variant="body2" sx={{ color:"#636e72", fontSize:"0.8rem" }}>{caseData.symptoms}</Typography>
                </Box>
              )}
            </InfoCard>

            {/* Status update */}
            <SectionLabel>Update Status</SectionLabel>
            <InfoCard>
              {isClosed ? (
                // Closed — lock everything with explanation
                <Box sx={{ p:2, bgcolor:"rgba(255,107,107,0.06)", borderRadius:"10px",
                  border:"1px solid rgba(255,107,107,0.2)", display:"flex", gap:1.5, alignItems:"flex-start" }}>
                  <Lock sx={{ color:"#ff6b6b", fontSize:18, mt:0.2, flexShrink:0 }} />
                  <Box>
                    <Typography fontWeight={700} sx={{ color:"#ff6b6b", fontSize:"0.82rem" }}>
                      Case Closed — No Further Updates
                    </Typography>
                    <Typography variant="caption" sx={{ color:"#8892a4" }}>
                      This case has been marked as <strong>{STATUS[caseData.status]?.label}</strong>.
                      Closed cases are locked and cannot be changed to protect data integrity.
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {/* Allowed-next visual hint */}
                  <Box>
                    <FieldLabel>Allowed Next Steps</FieldLabel>
                    <Stack direction="row" spacing={1} sx={{ mt:0.5 }} flexWrap="wrap">
                      {allowedTargets.length === 0
                        ? <Typography variant="caption" sx={{ color:"#aaa" }}>No further transitions</Typography>
                        : allowedTargets.map(t => (
                          <Chip key={t}
                            icon={<Box sx={{color:`${STATUS[t]?.color} !important`, display:"flex", ml:"4px !important"}}>{STATUS[t]?.icon}</Box>}
                            label={STATUS[t]?.label}
                            onClick={() => { setNewStatus(t); setStatusError(""); }}
                            size="small"
                            sx={{
                              cursor:"pointer", fontWeight:700, fontSize:"0.68rem", height:24,
                              bgcolor: newStatus===t ? STATUS[t]?.bg : "transparent",
                              color:   newStatus===t ? STATUS[t]?.color : "#8892a4",
                              border:  `1.5px solid ${newStatus===t ? STATUS[t]?.border : "#e0e0e0"}`,
                              transition:"all 0.15s",
                            }}
                          />
                        ))
                      }
                    </Stack>
                  </Box>

                  <FormControl fullWidth size="small">
                    <InputLabel>Change Status To</InputLabel>
                    <Select value={newStatus} label="Change Status To"
                      onChange={e => { setNewStatus(e.target.value); setStatusError(""); }}
                      sx={{ borderRadius:"10px", bgcolor:T.inputBg }}>
                      {Object.entries(STATUS).map(([key, cfg]) => {
                        const blocked = key === caseData.status || !allowedTargets.includes(key);
                        return (
                          <MenuItem key={key} value={key} disabled={blocked}
                            sx={{ opacity: blocked ? 0.4 : 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ width:"100%" }}>
                              <Box sx={{ color:cfg.color }}>{cfg.icon}</Box>
                              <Typography variant="body2" fontWeight={600}>{cfg.label}</Typography>
                              {blocked && key !== caseData.status && (
                                <Typography variant="caption" sx={{ color:"#bbb", ml:"auto", fontSize:"0.6rem" }}>
                                  Not allowed
                                </Typography>
                              )}
                              {key === caseData.status && (
                                <Typography variant="caption" sx={{ color:"#bbb", ml:"auto", fontSize:"0.6rem" }}>
                                  Current
                                </Typography>
                              )}
                            </Stack>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>

                  {/* Validation error */}
                  {statusError && (
                    <Box sx={{ p:1.5, bgcolor:"rgba(255,107,107,0.08)", borderRadius:"8px",
                      border:"1px solid rgba(255,107,107,0.25)", display:"flex", gap:1, alignItems:"flex-start" }}>
                      <Warning sx={{ color:"#ff6b6b", fontSize:16, mt:0.1, flexShrink:0 }} />
                      <Typography variant="caption" sx={{ color:"#ff6b6b", fontWeight:600, lineHeight:1.4 }}>
                        {statusError}
                      </Typography>
                    </Box>
                  )}

                  <TextField multiline rows={2} fullWidth
                    placeholder="Reason for status change (optional)…"
                    value={statusNote} onChange={e => setStatusNote(e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root":{ borderRadius:"10px", bgcolor:T.inputBg,
                      "& fieldset":{border:"none"} } }} />

                  <Button variant="contained" fullWidth onClick={handleStatusUpdate}
                    disabled={newStatus === caseData.status || !allowedTargets.includes(newStatus)}
                    sx={{ borderRadius:"10px", textTransform:"none", fontWeight:700, bgcolor:T.primary,
                      "&:hover":{bgcolor:"#2d3a5c"} }}>
                    Update Case Status
                    {newStatus && newStatus !== caseData.status && (
                      <Box component="span" sx={{ ml:1, opacity:0.7, fontSize:"0.75rem" }}>
                        → {STATUS[newStatus]?.label}
                      </Box>
                    )}
                  </Button>
                </Stack>
              )}
            </InfoCard>
          </Grid>

          {/* RIGHT — timeline + add note */}
          <Grid item xs={12} md={5} sx={{
            display:"flex", flexDirection:"column",
            height:{xs:"auto", md:"70vh"},
          }}>
            {/* Add Note panel — fixed at top */}
            <Box sx={{ p:{xs:2,sm:2.5}, bgcolor:"white", borderBottom:"1px solid #eee", flexShrink:0 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb:1.5 }}>
                <SectionLabel noMargin>Add Timeline Note</SectionLabel>
              </Stack>
              {/* Note type pills */}
              <Box sx={{ display:"flex", flexWrap:"wrap", gap:0.6, mb:1.5 }}>
                {NOTE_TYPES.map(nt => (
                  <Box key={nt.value} onClick={() => setNoteType(nt.value)}
                    sx={{ px:1, py:0.3, borderRadius:"99px", cursor:"pointer",
                      border:`1.5px solid ${noteType===nt.value ? nt.color : "#eee"}`,
                      bgcolor: noteType===nt.value ? `${nt.color}15` : "transparent",
                      transition:"all 0.15s", "&:hover":{borderColor:nt.color},
                    }}>
                    <Typography sx={{ fontSize:"0.62rem", fontWeight:700,
                      color: noteType===nt.value ? nt.color : "#bbb" }}>
                      {nt.emoji} {nt.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Stack direction="row" spacing={1}>
                <TextField fullWidth size="small"
                  placeholder="Type note, press Enter to save…"
                  value={noteText} onChange={e => setNoteText(e.target.value)}
                  onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); handleAddNote(); }}}
                  sx={{ "& .MuiOutlinedInput-root":{ borderRadius:"10px", bgcolor:T.inputBg, fontSize:"0.82rem",
                    "& fieldset":{ border: noteAdded ? "1.5px solid #00d4aa" : "none" }, transition:"all 0.2s" }}}
                />
                <Button variant="contained" onClick={handleAddNote}
                  disabled={!noteText.trim()}
                  sx={{ borderRadius:"10px", textTransform:"none", fontWeight:700, px:2, flexShrink:0,
                    bgcolor: noteAdded ? "#00d4aa" : curNoteCfg.color,
                    boxShadow:"none", minWidth:0, transition:"background 0.3s",
                    "&:hover":{bgcolor:curNoteCfg.color, filter:"brightness(0.9)", boxShadow:"none"},
                    "&.Mui-disabled":{bgcolor:"#eee", color:"#ccc"},
                  }}>
                  {noteAdded ? "✓" : <Add sx={{ fontSize:18 }} />}
                </Button>
              </Stack>
              <Typography variant="caption" sx={{ color:"#ccc", fontSize:"0.62rem", mt:0.5, display:"block" }}>
                "Recorded by" defaults to Admin · Shift+Enter for new line
              </Typography>
            </Box>

            {/* Timeline — scrollable */}
            <Box sx={{
              flex:1, overflowY:"auto", p:{xs:2,sm:2.5},
              "&::-webkit-scrollbar":{width:4},
              "&::-webkit-scrollbar-thumb":{background:"#e0e0e0", borderRadius:4},
            }}>
              <SectionLabel>Timeline · {caseData.timeline?.length||0} entries</SectionLabel>
              {(caseData.timeline||[]).map((t, i) => {
                const isLast  = i === caseData.timeline.length - 1;
                const isNote  = !!t.type;
                const noteCfg = NOTE_TYPES.find(n => n.value === t.type);
                const dotColor = isLast
                  ? (STATUS[caseData.status]?.color || "#00d4aa")
                  : isNote ? (noteCfg?.color||"#9c8fff") : "#d0d0d0";

                return (
                  <Box key={i} sx={{ display:"flex", gap:1.5, mb: isLast ? 0 : 2 }}>
                    <Box sx={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                      <Box sx={{
                        width:10, height:10, borderRadius:"50%", mt:0.4, flexShrink:0,
                        background:dotColor,
                        boxShadow: isLast ? `0 0 8px ${dotColor}` : isNote ? `0 0 4px ${dotColor}88` : "none",
                      }} />
                      {!isLast && <Box sx={{ width:2, flex:1, bgcolor:"#eee", mt:0.4, mb:0.4, minHeight:14 }} />}
                    </Box>
                    <Box sx={{ flex:1, pb:0.5 }}>
                      <Box sx={{
                        p: isNote ? 1.2 : 0, borderRadius: isNote ? "8px" : 0,
                        bgcolor: isNote ? `${noteCfg?.color||"#9c8fff"}0d` : "transparent",
                        border:  isNote ? `1px solid ${noteCfg?.color||"#9c8fff"}22` : "none",
                      }}>
                        <Typography variant="body2" fontWeight={700}
                          sx={{ color: isNote ? (noteCfg?.color||"#9c8fff") : T.primary,
                            fontSize:"0.8rem", lineHeight:1.4 }}>
                          {t.action}
                        </Typography>
                        <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt:0.3 }}>
                          <Typography variant="caption" sx={{ color:"#bbb", fontSize:"0.62rem" }}>{t.time}</Typography>
                          <Typography variant="caption" sx={{ color:"#ddd" }}>·</Typography>
                          <Typography variant="caption" sx={{ color:"#9c8fff", fontWeight:700, fontSize:"0.62rem" }}>{t.by}</Typography>
                        </Stack>
                      </Box>
                    </Box>
                  </Box>
                );
              })}

              {caseData.notes && (
                <Box sx={{ mt:2.5, p:2, bgcolor:"rgba(255,179,71,0.08)", borderRadius:"10px",
                  border:"1px solid rgba(255,179,71,0.2)" }}>
                  <FieldLabel color="#ffb347">Case Notes</FieldLabel>
                  <Typography variant="body2" sx={{ color:"#636e72", fontSize:"0.8rem", lineHeight:1.5 }}>
                    {caseData.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers for consistent typography
// ─────────────────────────────────────────────────────────────────────────────
function SectionLabel({ children, noMargin }) {
  return (
    <Typography variant="caption" sx={{
      color:"#8892a4", fontWeight:800, textTransform:"uppercase",
      letterSpacing:"0.08em", fontSize:"0.6rem", display:"block",
      mb: noMargin ? 0 : 1,
    }}>
      {children}
    </Typography>
  );
}
function FieldLabel({ children, color }) {
  return (
    <Typography variant="caption" sx={{
      color: color||"#aaa", fontWeight:700, textTransform:"uppercase",
      letterSpacing:"0.05em", fontSize:"0.58rem", display:"block", mb:0.3,
    }}>
      {children}
    </Typography>
  );
}
function InfoCard({ children }) {
  return (
    <Box sx={{ bgcolor:"white", borderRadius:"12px", p:2, mb:2, boxShadow:T.shadow }}>
      {children}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Case Card  — uniform height via flex column, no stretching
// ─────────────────────────────────────────────────────────────────────────────
function CaseCard({ caseData, onView, onDelete, onStatusChange }) {
  const sc      = STATUS[caseData.status] || STATUS.reported;
  const isUrgent = ["reported","confirmed"].includes(caseData.status);
  const isClosed = ["recovered","death"].includes(caseData.status);

  const quickNext = {
    reported:  { to:"confirmed", label:"Confirm",   color:"#4fc3f7" },
    confirmed: { to:"treating",  label:"Admit",      color:"#9c8fff" },
    treating:  { to:"recovered", label:"Recovered",  color:"#00d4aa" },
  }[caseData.status];

  return (
    <Card sx={{
      borderRadius:"18px", boxShadow:T.shadow, border:"none", overflow:"hidden",
      display:"flex", flexDirection:"column", height:"100%",
      transition:"transform 0.2s, box-shadow 0.2s",
      "&:hover":{ transform:"translateY(-3px)", boxShadow:"0 12px 32px rgba(0,0,0,0.12)" },
      borderLeft:`4px solid ${sc.color}`,
    }}>
      <CardContent sx={{ p:0, display:"flex", flexDirection:"column", flex:1 }}>

        {/* Top */}
        <Box sx={{ px:2.5, pt:2.5, pb:1.5, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <Box sx={{ minWidth:0, flex:1, mr:1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb:0.5 }} flexWrap="wrap">
              <Typography variant="caption" sx={{ color:"#aaa", fontWeight:700, fontSize:"0.62rem" }}>
                {caseData.id}
              </Typography>
              {isUrgent && (
                <Box sx={{ px:0.8, py:0.1, bgcolor:"rgba(255,107,107,0.12)", borderRadius:"99px",
                  border:"1px solid rgba(255,107,107,0.25)" }}>
                  <Typography sx={{ color:"#ff6b6b", fontSize:"0.58rem", fontWeight:800 }}>URGENT</Typography>
                </Box>
              )}
              {isClosed && (
                <Box sx={{ px:0.8, py:0.1, bgcolor:"rgba(0,0,0,0.05)", borderRadius:"99px",
                  border:"1px solid rgba(0,0,0,0.08)" }}>
                  <Typography sx={{ color:"#aaa", fontSize:"0.58rem", fontWeight:700 }}>CLOSED</Typography>
                </Box>
              )}
            </Stack>
            <Typography fontWeight={800} sx={{ color:T.primary, fontSize:"0.95rem", lineHeight:1.2 }} noWrap>
              {caseData.patient_name}
            </Typography>
            <Typography variant="caption" sx={{ color:"#8892a4" }}>
              {caseData.age} yrs · {caseData.gender} · {caseData.district}
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink:0 }}>
            <StatusBadge status={caseData.status} />
            <IconButton size="small" onClick={() => onDelete(caseData.id)}
              sx={{ color:"#ddd", "&:hover":{color:"#ff6b6b", bgcolor:"#fff0f0"} }}>
              <Delete sx={{ fontSize:15 }} />
            </IconButton>
          </Stack>
        </Box>

        <Divider sx={{ mx:2.5, borderStyle:"dashed" }} />

        {/* Info grid — fixed height */}
        <Box sx={{ px:2.5, py:1.5, flex:1 }}>
          <Grid container spacing={1}>
            {[
              {label:"Snake",   value:caseData.snake_type,   color:"#ff6b6b"},
              {label:"Bite",    value:caseData.bite_location},
              {label:"CHW",     value:caseData.chw_name||"—"},
              {label:"Hospital",value:caseData.hospital||"—"},
            ].map(f => (
              <Grid item xs={6} key={f.label}>
                <Typography variant="caption" sx={{ color:"#bbb", fontWeight:700,
                  textTransform:"uppercase", letterSpacing:"0.05em", fontSize:"0.56rem", display:"block" }}>
                  {f.label}
                </Typography>
                <Typography variant="body2" fontWeight={700}
                  sx={{ color:f.color||T.primary, fontSize:"0.78rem", overflow:"hidden",
                    textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {f.value}
                </Typography>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt:1.5, display:"flex", alignItems:"center", gap:1 }}>
            <Box sx={{ px:1, py:0.3, borderRadius:"6px",
              bgcolor: caseData.asv_given ? "rgba(0,212,170,0.1)" : "rgba(255,107,107,0.06)",
              border:`1px solid ${caseData.asv_given ? "rgba(0,212,170,0.25)" : "rgba(255,107,107,0.15)"}`,
              flexShrink:0 }}>
              <Typography sx={{ fontSize:"0.62rem", fontWeight:700,
                color: caseData.asv_given ? "#00d4aa" : "#ff6b6b" }}>
                {caseData.asv_given ? `ASV ✓ ${caseData.asv_vials} vials` : "No ASV"}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color:"#ccc", ml:"auto", fontSize:"0.62rem", flexShrink:0 }}>
              <AccessTime sx={{ fontSize:10, mr:0.3, verticalAlign:"middle" }} />
              {caseData.bite_time?.split("T")[0]}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mx:2.5, borderStyle:"dashed" }} />

        {/* Actions */}
        <Box sx={{ px:2.5, py:2, display:"flex", gap:1 }}>
          <Button fullWidth variant="outlined" startIcon={<Visibility sx={{ fontSize:14 }} />}
            onClick={() => onView(caseData)}
            sx={{ borderRadius:"10px", textTransform:"none", fontWeight:700, fontSize:"0.78rem",
              borderColor:"#eee", color:T.primary, "&:hover":{borderColor:T.primary, bgcolor:"#f8f9fa"} }}>
            Details
          </Button>
          {quickNext && !isClosed && (
            <Button fullWidth variant="contained"
              onClick={() => onStatusChange(caseData.id, quickNext.to, "")}
              sx={{ borderRadius:"10px", textTransform:"none", fontWeight:700, fontSize:"0.78rem",
                bgcolor:quickNext.color, boxShadow:"none",
                "&:hover":{bgcolor:quickNext.color, filter:"brightness(0.9)", boxShadow:"none"} }}>
              {quickNext.label}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Form validation helper
// ─────────────────────────────────────────────────────────────────────────────
function validateForm(form) {
  const errors = {};
  if (!form.patient_name.trim())  errors.patient_name = "Patient name is required";
  if (!form.age || isNaN(form.age) || +form.age <= 0 || +form.age > 120)
    errors.age = "Valid age (1–120) required";
  if (!form.district)             errors.district = "District is required";
  if (!form.bite_time)            errors.bite_time = "Bite date & time is required";
  if (form.bite_time && new Date(form.bite_time) > new Date())
    errors.bite_time = "Bite time cannot be in the future";
  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function SnakeBiteCases() {
  const [cases,         setCases]         = useState(MOCK_CASES);
  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState("all");
  const [activeTab,     setActiveTab]     = useState(0);
  const [openDetail,    setOpenDetail]    = useState(false);
  const [selectedCase,  setSelectedCase]  = useState(null);
  const [openAdd,       setOpenAdd]       = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form,          setForm]          = useState(emptyForm);
  const [formErrors,    setFormErrors]    = useState({});
  const [snack,         setSnack]         = useState({open:false, message:"", severity:"success"});

  const showSnack = (message, severity="success") => setSnack({open:true, message, severity});
  const f = (key) => ({ // TextField helper
    value:    form[key],
    onChange: e => { setForm({...form, [key]:e.target.value}); setFormErrors({...formErrors, [key]:""}); },
    error:    !!formErrors[key],
    helperText: formErrors[key]||"",
  });

  // Stats
  const stats = useMemo(() => [
    {label:"Total",     value:cases.length,                                                                            color:"#9c8fff"},
    {label:"Active",    value:cases.filter(c=>["reported","confirmed","treating","referred"].includes(c.status)).length, color:"#ffb347"},
    {label:"Recovered", value:cases.filter(c=>c.status==="recovered").length,                                          color:"#00d4aa"},
    {label:"Deaths",    value:cases.filter(c=>c.status==="death").length,                                              color:"#ff6b6b"},
  ], [cases]);

  // Filtered
  const filtered = useMemo(() => {
    let r = cases;
    if (filterStatus !== "all") r = r.filter(c => c.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(c =>
        c.patient_name.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.snake_type.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    if (activeTab===1) r = r.filter(c=>["reported","confirmed"].includes(c.status));
    if (activeTab===2) r = r.filter(c=>["treating","referred"].includes(c.status));
    if (activeTab===3) r = r.filter(c=>["recovered","death"].includes(c.status));
    return r;
  }, [cases, search, filterStatus, activeTab]);

  // Helpers to keep selectedCase in sync after mutations
  const mutateCases = (updater) => {
    setCases(prev => {
      const next = updater(prev);
      if (selectedCase) {
        const updated = next.find(c => c.id === selectedCase.id);
        if (updated) setSelectedCase(updated);
      }
      return next;
    });
  };

  const handleStatusChange = (id, newStatus, note) => {
    mutateCases(prev => prev.map(c => {
      if (c.id !== id) return c;
      const entry = {
        time:   new Date().toLocaleTimeString("en-GB", {hour:"2-digit", minute:"2-digit"}),
        action: `Status → ${STATUS[newStatus]?.label}${note ? ` — ${note}` : ""}`,
        by:     "Admin",
      };
      return {...c, status:newStatus, timeline:[...(c.timeline||[]), entry]};
    }));
    showSnack(`Case updated to ${STATUS[newStatus]?.label}`);
  };

  const handleAddNote = (id, entry) => {
    mutateCases(prev => prev.map(c =>
      c.id === id ? {...c, timeline:[...(c.timeline||[]), entry]} : c
    ));
    showSnack("Note added to timeline");
  };

  const handleAddCase = () => {
    const errors = validateForm(form);
    if (Object.keys(errors).length) { setFormErrors(errors); showSnack("Please fix the errors below", "error"); return; }
    const newCase = {
      ...form,
      id:          `SBC-${String(cases.length+1).padStart(3,"0")}`,
      status:      "reported",
      reported_at: new Date().toISOString(),
      age:         parseInt(form.age),
      asv_given:   false, asv_vials:0, chw_name:null,
      latitude:null, longitude:null,
      timeline:[{
        time:   new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}),
        action: "Case registered by admin", by:"Admin",
      }],
    };
    setCases(prev => [newCase, ...prev]);
    showSnack("Case registered successfully");
    setOpenAdd(false);
    setForm(emptyForm);
    setFormErrors({});
  };

  const handleDeleteConfirm = () => {
    setCases(prev => prev.filter(c => c.id !== deleteConfirm));
    showSnack("Case deleted", "info");
    setDeleteConfirm(null);
  };

  const urgentCount = cases.filter(c => ["reported","confirmed"].includes(c.status)).length;

  return (
    <Box sx={{ bgcolor:T.bg, minHeight:"100vh", pb:6 }}>

      {/* ── Header ── */}
      <Box sx={{ px:{xs:2, sm:4}, pt:{xs:3, sm:4}, pb:2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
              <Typography variant="h4" fontWeight={800}
                sx={{ color:T.primary, fontFamily:"'DM Sans', sans-serif", fontSize:{xs:"1.5rem",sm:"2rem"} }}>
                Snake Bite Cases
              </Typography>
              {urgentCount > 0 && (
                <Box sx={{ px:1.5, py:0.4, bgcolor:"rgba(255,107,107,0.12)", borderRadius:"99px",
                  border:"1px solid rgba(255,107,107,0.3)" }}>
                  <Typography sx={{ color:"#ff6b6b", fontSize:"0.72rem", fontWeight:800 }}>
                    {urgentCount} URGENT
                  </Typography>
                </Box>
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt:0.3 }}>
              Case Tracking · CHW Workflow · Patient Outcomes
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setForm(emptyForm); setFormErrors({}); setOpenAdd(true); }}
            sx={{ bgcolor:T.primary, borderRadius:"10px", textTransform:"none", px:3, fontWeight:700, flexShrink:0 }}>
            Register Case
          </Button>
        </Stack>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mt:2 }}>
          {stats.map(s => (
            <Grid item xs={6} sm={3} key={s.label}>
              <Card sx={{ borderRadius:"14px", boxShadow:T.shadow, border:"none" }}>
                <CardContent sx={{ p:2, display:"flex", alignItems:"center", gap:1.5, "&:last-child":{pb:2} }}>
                  <Box sx={{ width:44, height:44, borderRadius:"11px", bgcolor:`${s.color}18`,
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Typography sx={{ fontWeight:800, color:s.color, fontSize:"1.1rem" }}>{s.value}</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color:"#8892a4", fontWeight:700,
                    textTransform:"uppercase", letterSpacing:"0.06em", fontSize:"0.65rem", lineHeight:1.3 }}>
                    {s.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Search + filter */}
        <Box sx={{ mt:2.5, p:2, bgcolor:"white", borderRadius:"14px", boxShadow:T.shadow }}>
          <Stack direction={{xs:"column",sm:"row"}} spacing={1.5}>
            <TextField fullWidth placeholder="Search name, district, snake, case ID…"
              value={search} onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment:<InputAdornment position="start"><Search sx={{ color:"text.secondary", fontSize:20 }} /></InputAdornment>,
                sx:{ borderRadius:"10px", bgcolor:T.inputBg, "& fieldset":{border:"none"} },
              }}
            />
            <FormControl sx={{ minWidth:{xs:"100%", sm:180} }}>
              <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} displayEmpty
                startAdornment={<FilterList sx={{ mr:1, color:"#8892a4", fontSize:18 }} />}
                sx={{ borderRadius:"10px", bgcolor:T.inputBg, "& fieldset":{border:"none"},
                  fontWeight:600, fontSize:"0.85rem" }}>
                <MenuItem value="all">All Statuses</MenuItem>
                {Object.entries(STATUS).map(([key,cfg]) => (
                  <MenuItem key={key} value={key}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ color:cfg.color }}>{cfg.icon}</Box>
                      <span>{cfg.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Tabs */}
        <Box sx={{ mt:2 }}>
          <Tabs value={activeTab} onChange={(_,v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
            sx={{
              "& .MuiTab-root":{textTransform:"none", fontWeight:700, fontSize:"0.82rem", minHeight:38, px:2},
              "& .MuiTabs-indicator":{bgcolor:T.primary, height:3, borderRadius:"3px 3px 0 0"},
            }}>
            <Tab label={`All (${cases.length})`} />
            <Tab label={`🚨 Urgent (${cases.filter(c=>["reported","confirmed"].includes(c.status)).length})`} />
            <Tab label={`🏥 Treating (${cases.filter(c=>["treating","referred"].includes(c.status)).length})`} />
            <Tab label={`✅ Closed (${cases.filter(c=>["recovered","death"].includes(c.status)).length})`} />
          </Tabs>
        </Box>
      </Box>

      {/* ── Cards Grid ── */}
      <Box sx={{ px:{xs:2, sm:4} }}>
        {filtered.length === 0 && (
          <Box sx={{ textAlign:"center", mt:8, pb:8 }}>
            <Coronavirus sx={{ fontSize:52, color:"#ddd" }} />
            <Typography variant="body1" fontWeight={600} sx={{ mt:1, color:"#aaa" }}>No cases found</Typography>
          </Box>
        )}
        <Grid container spacing={2.5} alignItems="stretch">
          {filtered.map(c => (
            <Grid item key={c.id} xs={12} sm={6} lg={4} sx={{ display:"flex" }}>
              <Box sx={{ width:"100%" }}>
                <CaseCard
                  caseData={c}
                  onView={cd => { setSelectedCase(cd); setOpenDetail(true); }}
                  onDelete={id => setDeleteConfirm(id)}
                  onStatusChange={handleStatusChange}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── Detail Dialog ── */}
      <CaseDetailDialog
        caseData={selectedCase}
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        onStatusChange={handleStatusChange}
        onAddNote={handleAddNote}
      />

      {/* ── Register Case Dialog ── */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx:{ borderRadius:"16px", overflow:"hidden", m:{xs:1, sm:2} } }}>
        <Box sx={{ bgcolor:T.primary, px:3, py:2.5, position:"relative" }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width:36, height:36, borderRadius:"10px", bgcolor:"rgba(255,255,255,0.1)",
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Coronavirus sx={{ color:"#ff6b6b", fontSize:20 }} />
            </Box>
            <Box>
              <Typography fontWeight={700} sx={{ color:"#fff", lineHeight:1.2 }}>Register Snake Bite Case</Typography>
              <Typography variant="caption" sx={{ color:"rgba(255,255,255,0.45)" }}>Fields marked * are required</Typography>
            </Box>
          </Stack>
          <IconButton onClick={() => setOpenAdd(false)} size="small"
            sx={{ position:"absolute", right:12, top:12, color:"rgba(255,255,255,0.5)", "&:hover":{color:"#fff"} }}>
            <Close />
          </IconButton>
        </Box>

        <DialogContent sx={{ p:3, bgcolor:"#fcfdfe" }}>
          <Stack spacing={2}>

            <SectionLabel>Patient Details</SectionLabel>
            {/* Name row */}
            <TextField label="Patient Name *" fullWidth {...f("patient_name")}
              InputProps={{ sx:{borderRadius:"10px", bgcolor:T.inputBg, "& fieldset":{border:"none"}} }}
              InputLabelProps={{ shrink:true }} />

            <Stack direction="row" spacing={1.5}>
              <TextField label="Age *" type="number" {...f("age")}
                InputProps={{ sx:{borderRadius:"10px", bgcolor:T.inputBg, "& fieldset":{border:"none"}},
                  inputProps:{min:1,max:120} }}
                InputLabelProps={{ shrink:true }} sx={{ width:90 }} />
              <FormControl sx={{ flex:1 }}>
                <InputLabel shrink>Gender</InputLabel>
                <Select value={form.gender} label="Gender"
                  onChange={e => setForm({...form, gender:e.target.value})}
                  sx={{ borderRadius:"10px", bgcolor:T.inputBg, "& fieldset":{border:"none"} }}>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Phone" {...f("phone")} sx={{ flex:2 }}
                InputProps={{ sx:{borderRadius:"10px", bgcolor:T.inputBg, "& fieldset":{border:"none"}} }}
                InputLabelProps={{ shrink:true }} />
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <FormControl fullWidth error={!!formErrors.district}>
                <InputLabel shrink>District *</InputLabel>
                <Select value={form.district} label="District *"
                  onChange={e => { setForm({...form, district:e.target.value}); setFormErrors({...formErrors, district:""}); }}
                  sx={{ borderRadius:"10px", bgcolor:T.inputBg, "& fieldset":{border:"none"} }}>
                  {DISTRICTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
                {formErrors.district && <Typography variant="caption" sx={{ color:"#ff6b6b", mt:0.3, ml:1.5 }}>{formErrors.district}</Typography>}
              </FormControl>
              <TextField label="Address" {...f("address")} sx={{ flex:1.5 }}
                InputProps={{ sx:{borderRadius:"10px", bgcolor:T.inputBg, "& fieldset":{border:"none"}} }}
                InputLabelProps={{ shrink:true }} />
            </Stack>

            <Divider sx={{ borderStyle:"dashed" }}>
              <Typography variant="caption" sx={{ color:"#aaa", fontWeight:600, textTransform:"uppercase",
                letterSpacing:"0.06em", fontSize:"0.6rem" }}>Bite Details</Typography>
            </Divider>

            <Stack direction="row" spacing={1.5}>
              <FormControl fullWidth>
                <InputLabel shrink>Snake Type</InputLabel>
                <Select value={form.snake_type} label="Snake Type"
                  onChange={e => setForm({...form, snake_type:e.target.value})}
                  sx={{ borderRadius:"10px", bgcolor:T.inputBg, "& fieldset":{border:"none"} }}>
                  {SNAKE_TYPES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel shrink>Bite Location</InputLabel>
                <Select value={form.bite_location} label="Bite Location"
                  onChange={e => setForm({...form, bite_location:e.target.value})}
                  sx={{ borderRadius:"10px", bgcolor:T.inputBg, "& fieldset":{border:"none"} }}>
                  {BODY_PARTS.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>

            <TextField label="Bite Date & Time *" type="datetime-local" fullWidth
              {...f("bite_time")}
              InputProps={{ sx:{borderRadius:"10px", bgcolor:T.inputBg, "& fieldset":{border:"none"}} }}
              InputLabelProps={{ shrink:true }}
              inputProps={{ max: new Date().toISOString().slice(0,16) }}
            />

            <TextField label="Symptoms" multiline rows={2} fullWidth {...f("symptoms")}
              placeholder="Swelling, nausea, paralysis…"
              InputProps={{ sx:{borderRadius:"10px", bgcolor:T.inputBg, "& fieldset":{border:"none"}} }}
              InputLabelProps={{ shrink:true }} />

            <Stack direction="row" spacing={1.5}>
              <FormControl fullWidth>
                <InputLabel shrink>Hospital (if admitted)</InputLabel>
                <Select value={form.hospital} label="Hospital (if admitted)"
                  onChange={e => setForm({...form, hospital:e.target.value})}
                  sx={{ borderRadius:"10px", bgcolor:T.inputBg, "& fieldset":{border:"none"} }}>
                  <MenuItem value="">Not admitted yet</MenuItem>
                  {HOSPITALS.map(h => <MenuItem key={h} value={h}>{h}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>

            <TextField label="Notes" fullWidth {...f("notes")}
              InputProps={{ sx:{borderRadius:"10px", bgcolor:T.inputBg, "& fieldset":{border:"none"}} }}
              InputLabelProps={{ shrink:true }} />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px:3, pb:3, gap:1 }}>
          <Button onClick={() => setOpenAdd(false)}
            sx={{ color:"text.secondary", textTransform:"none", fontWeight:700 }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCase}
            sx={{ bgcolor:T.primary, px:4, borderRadius:"10px", textTransform:"none", fontWeight:700 }}>
            Register Case
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx:{ borderRadius:"15px", overflow:"hidden", m:{xs:1, sm:2} } }}>
        <Box sx={{ bgcolor:"#fff1f0", p:3, borderBottom:"1px solid #ffe0de" }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width:36, height:36, borderRadius:"10px", bgcolor:"rgba(255,107,107,0.15)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Delete sx={{ color:"#ff6b6b", fontSize:20 }} />
            </Box>
            <Box>
              <Typography fontWeight={800} sx={{ color:T.primary }}>Delete Case</Typography>
              <Typography variant="caption" sx={{ color:"#8892a4" }}>This cannot be undone</Typography>
            </Box>
          </Stack>
        </Box>
        <DialogContent sx={{ p:3 }}>
          <Typography variant="body2" sx={{ color:"#636e72" }}>
            Delete case <strong style={{color:T.primary}}>{deleteConfirm}</strong>?
            The entire record including timeline will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:3, gap:1 }}>
          <Button onClick={() => setDeleteConfirm(null)}
            sx={{ color:"text.secondary", textTransform:"none", fontWeight:700 }}>Cancel</Button>
          <Button variant="contained" onClick={handleDeleteConfirm}
            sx={{ bgcolor:"#ff6b6b", px:3, borderRadius:"10px", textTransform:"none", fontWeight:700,
              boxShadow:"none", "&:hover":{bgcolor:"#e05555", boxShadow:"none"} }}>
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar open={snack.open} autoHideDuration={3500}
        onClose={() => setSnack(s => ({...s, open:false}))}
        anchorOrigin={{vertical:"bottom", horizontal:"center"}}>
        <Alert severity={snack.severity} variant="filled"
          onClose={() => setSnack(s => ({...s, open:false}))}
          sx={{ borderRadius:"10px" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}