import type { Locale } from "./config";

type Dict = Record<string, string>;

const en: Dict = {
  // Common
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.saveChanges": "Save changes",
  "common.saved": "Saved ✓",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.signIn": "Sign in",
  "common.signOut": "Sign out",
  "common.getStarted": "Get started",
  "common.loading": "Loading",
  "common.somethingWrong": "Something went wrong.",
  "common.optional": "(optional)",
  "common.all": "All",
  "common.viewAll": "View all",
  "common.record": "Record",
  "common.backToSignIn": "Back to sign in",
  "common.checkInbox": "Check your inbox",

  // Brand / nav
  "nav.dashboard": "Dashboard",
  "nav.treatments": "Treatments",
  "nav.calendar": "Calendar",
  "nav.doses": "Doses",
  "nav.injectionSites": "Injection Sites",
  "nav.sideEffects": "Side Effects",
  "nav.transition": "Transition",
  "nav.stats": "Statistics",
  "nav.calculator": "Calculator",
  "nav.history": "History",
  "nav.settings": "Settings",
  "nav.more": "More",
  "nav.signedIn": "Signed in",
  "nav.recordDose": "Record a dose",
  "nav.allSections": "All sections",

  // Dose / treatment / severity statuses
  "status.scheduled": "scheduled",
  "status.completed": "completed",
  "status.missed": "missed",
  "status.skipped": "skipped",
  "status.active": "active",
  "status.paused": "paused",
  "status.archived": "archived",
  "severity.mild": "mild",
  "severity.moderate": "moderate",
  "severity.severe": "severe",

  // Status option labels (filters, forms)
  "statusOpt.scheduled": "Scheduled",
  "statusOpt.completed": "Completed",
  "statusOpt.missed": "Missed",
  "statusOpt.skipped": "Skipped",
  "severityOpt.mild": "Mild",
  "severityOpt.moderate": "Moderate",
  "severityOpt.severe": "Severe",

  // Weekdays (short) — 0 = Sunday
  "weekday.0": "Sun",
  "weekday.1": "Mon",
  "weekday.2": "Tue",
  "weekday.3": "Wed",
  "weekday.4": "Thu",
  "weekday.5": "Fri",
  "weekday.6": "Sat",

  // Injection site names (by body region)
  "site.abdomen_upper_left": "Abdomen — upper left",
  "site.abdomen_upper_right": "Abdomen — upper right",
  "site.abdomen_lower_left": "Abdomen — lower left",
  "site.abdomen_lower_right": "Abdomen — lower right",
  "site.thigh_left": "Thigh — left",
  "site.thigh_right": "Thigh — right",
  "site.glute_left": "Glute — left",
  "site.glute_right": "Glute — right",
  "site.arm_left": "Upper arm — left",
  "site.arm_right": "Upper arm — right",

  // Common side effects
  "se.nausea": "Nausea",
  "se.headache": "Headache",
  "se.fatigue": "Fatigue",
  "se.injectionRedness": "Injection site redness",
  "se.injectionPain": "Injection site pain",
  "se.dizziness": "Dizziness",
  "se.constipation": "Constipation",
  "se.diarrhea": "Diarrhea",
  "se.appetite": "Decreased appetite",
  "se.bloating": "Bloating",
  "se.heartburn": "Heartburn",

  // Landing
  "landing.heroTitle": "A calm home for your peptide protocol.",
  "landing.heroSubtitle":
    "Track doses, rotate injection sites, log side effects, and see your progress — organized automatically around the schedule you set.",
  "landing.createTracker": "Create your tracker",
  "landing.disclaimer": "A tracking and organization tool — not medical advice.",
  "landing.feature.calendar.title": "Automatic calendar",
  "landing.feature.calendar.desc":
    "Your full dose schedule, generated from the protocol you configure.",
  "landing.feature.rotation.title": "Site rotation",
  "landing.feature.rotation.desc":
    "A visual body map remembers where you injected and suggests where to go next.",
  "landing.feature.math.title": "Reconstitution math",
  "landing.feature.math.desc":
    "BAC water calculations from your vial size and target concentration.",
  "landing.feature.progress.title": "Progress & history",
  "landing.feature.progress.desc":
    "Adherence, completed doses, and side effects — all in one calm overview.",
  "landing.feature.reminders.title": "Dose reminders",
  "landing.feature.reminders.desc":
    "Optional notifications so a scheduled dose never slips by.",
  "landing.feature.private.title": "Private by design",
  "landing.feature.private.desc":
    "Your data is yours alone, protected with row-level security.",
  "landing.footer": "Ascend Tracker — organize an existing treatment protocol.",

  // Auth
  "auth.welcomeBack": "Welcome back",
  "auth.signInSubtitle": "Sign in to your tracker.",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.forgotPassword": "Forgot password?",
  "auth.createAccount": "Create account",
  "auth.incorrectCredentials": "Incorrect email or password.",
  "auth.demoTitle": "Demo mode",
  "auth.demoBody":
    "No account needed — the fields are pre-filled. Just press Sign in to explore with sample data stored only in this browser.",
  "auth.createTitle": "Create your account",
  "auth.createSubtitle": "A private space for your protocol.",
  "auth.name": "Name",
  "auth.confirmPassword": "Confirm password",
  "auth.min8": "At least 8 characters",
  "auth.repeatPassword": "Repeat your password",
  "auth.confirmEmailBody":
    "We sent a confirmation link to your email. Open it to activate your account, then sign in.",
  "auth.haveAccount": "Already have an account?",
  "auth.resetTitle": "Reset your password",
  "auth.resetSubtitle": "Enter your email and we'll send a reset link.",
  "auth.resetSentBody":
    "If an account exists for that email, a reset link is on its way.",
  "auth.sendResetLink": "Send reset link",
  "auth.newPasswordTitle": "Choose a new password",
  "auth.newPasswordSubtitle":
    "You're signed in through your reset link — set a new password below.",
  "auth.newPassword": "New password",
  "auth.repeatNewPassword": "Repeat your new password",
  "auth.updatePassword": "Update password",
  "auth.resetExpired": "This reset link has expired. Request a new one.",

  // Dashboard
  "dash.morning": "Good morning",
  "dash.afternoon": "Good afternoon",
  "dash.evening": "Good evening",
  "dash.noTreatmentsTitle": "No treatments yet",
  "dash.noTreatmentsDesc":
    "Create your first treatment protocol and your dose calendar will be generated automatically.",
  "dash.createTreatment": "Create treatment",
  "dash.nextDose": "Next dose",
  "dash.markCompleted": "Mark as completed",
  "dash.noUpcoming": "No upcoming doses scheduled.",
  "dash.reviewTreatments": "Review your treatments",
  "dash.treatmentProgress": "Treatment progress",
  "dash.weekOf": "Week {n} of {total}",
  "dash.dosesOf": "{completed} of {total} doses",
  "dash.noActive": "No active treatment.",
  "dash.injectionSites": "Injection sites",
  "dash.nextSuggested": "Next suggested: {name}",
  "dash.upcomingDoses": "Upcoming doses",
  "dash.nothingScheduled": "Nothing scheduled",
  "dash.sideEffects": "Side effects",
  "dash.noSideEffects": "No side effects recorded",
  "dash.stat.completed": "Doses completed",
  "dash.stat.remaining": "Doses remaining",
  "dash.stat.adherence": "Adherence",
  "dash.stat.sitesUsed": "Sites used",
  "dash.stat.sideEffects": "Side effects",
  "dash.sitesUsedValue": "{used} of {total}",

  // Treatments
  "tr.title": "Treatments",
  "tr.subtitle": "Your protocols and their schedules.",
  "tr.new": "New treatment",
  "tr.emptyDesc":
    "Create a treatment and its dose calendar will be generated from your schedule.",
  "tr.createTreatment": "Create treatment",
  "tr.freq.daily": "Daily",
  "tr.freq.everyN": "Every {n} days",
  "tr.dosesOf": "{completed} of {total} doses",
  "tr.started": "Started {date}",
  "tr.startedEnds": "Started {start} · ends {end}",
  "tr.newSubtitle":
    "Enter your protocol — the dose calendar is generated from these parameters.",

  // Treatment form
  "form.peptideName": "Peptide name",
  "form.peptideNamePh": "e.g. Retatrutide",
  "form.peptideHint":
    "Start typing — pick a suggestion to autofill and see reference info.",
  "form.vialQuantity": "Vial quantity",
  "form.vialUnit": "Vial unit",
  "form.doseAmount": "Dose amount",
  "form.doseUnit": "Dose unit",
  "form.startDate": "Start date",
  "form.durationWeeks": "Duration (weeks)",
  "form.frequency": "Frequency",
  "form.freqEveryDay": "Every day",
  "form.freqEveryN": "Every N days",
  "form.freqWeekdays": "Specific weekdays",
  "form.time": "Time",
  "form.intervalDays": "Interval (days)",
  "form.intervalHint":
    "A dose every this many days, starting on the start date.",
  "form.daysOfWeek": "Days of the week",
  "form.notes": "Notes",
  "form.notesTreatmentPh": "Protocol details, supplier, batch, anything useful…",
  "form.schedulePreview":
    "This schedule generates {n} doses over {weeks} weeks.",

  // Peptide reference
  "peptide.reference": "Quick reference",
  "peptide.function": "Function (reported online)",
  "peptide.dose": "Dose (user-reported)",
  "peptide.frequency": "Frequency",
  "peptide.disclaimer":
    "Anecdotal figures compiled from online user reports — not medical advice.",
  "peptide.empty": "Type or pick a peptide to see reference info.",

  // Treatment detail
  "trd.editTreatment": "Edit treatment",
  "trd.editHint":
    "Changing the schedule rebuilds the calendar. Doses you've already recorded are kept; the rest are regenerated to match.",
  "trd.resume": "Resume",
  "trd.pause": "Pause",
  "trd.completedStat": "Completed",
  "trd.missedStat": "Missed",
  "trd.progressStat": "Progress",
  "trd.ofDoses": "of {total} doses",
  "trd.notes": "Notes",
  "trd.recentDoses": "Recent doses",
  "trd.noDoses": "No doses generated.",
  "trd.deleteTitle": "Delete treatment?",
  "trd.deleteMessage":
    "This permanently removes “{name}” and its entire dose history. This cannot be undone.",
  "trd.deleteConfirm": "Delete treatment",
  "trd.summary": "{amount} {unit} at {time} · started {date}",

  // Calendar
  "cal.title": "Calendar",
  "cal.subtitle": "Scheduled doses, generated from your treatments.",
  "cal.today": "Today",
  "cal.prevMonth": "Previous month",
  "cal.nextMonth": "Next month",
  "cal.noDosesDay": "No doses this day",

  // Doses
  "dose.title": "Doses",
  "dose.subtitle": "What's due now and what's coming this week.",
  "dose.dueNow": "Due now",
  "dose.allCaughtUp": "All caught up",
  "dose.allCaughtUpDesc": "No doses waiting to be recorded.",
  "dose.next7": "Next 7 days",
  "dose.nothingScheduledDesc": "Doses appear here once a treatment is active.",
  "dose.notYetAvailable": "Available on the dose day (today or tomorrow only).",

  // Record page
  "rec.title": "Record a dose",
  "rec.subtitle": "Pick the scheduled dose you just administered.",
  "rec.recorded": "Dose recorded.",
  "rec.nothingTitle": "Nothing to record",
  "rec.nothingDesc":
    "There are no scheduled doses. Create or resume a treatment first.",

  // Record dose dialog
  "rdd.title": "Record dose — {name}",
  "rdd.amount": "Amount",
  "rdd.unit": "Unit",
  "rdd.administeredAt": "Administered at",
  "rdd.injectionSite": "Injection site",
  "rdd.suggested": "Suggested: {name}",
  "rdd.noSite": "No site recorded",
  "rdd.notesPh": "Anything worth remembering about this dose…",
  "rdd.markCompleted": "Mark as completed",

  // Edit dose dialog
  "edd.title": "Edit dose — {name}",
  "edd.scheduledFor": "Scheduled for",
  "edd.notesPh": "Notes for this dose…",
  "edd.skip": "Skip this dose",
  "edd.restore": "Restore to scheduled",

  // Injection sites page
  "is.title": "Injection sites",
  "is.subtitle": "Rotation history and which areas are available.",
  "is.bodyMap": "Body map",
  "is.allAreas": "All areas",
  "is.noSites": "No sites configured",
  "is.usedRecently": "Used recently",
  "is.ready": "Ready",
  "is.notUsed": "Not used",
  "is.injections": "{n} injections",
  "is.injectionsLastUsed": "{n} injections · last used {day}",
  "is.available": "Available",
  "is.legendRecent": "Used recently",
  "is.legendUsed": "Used",
  "is.legendNotUsed": "Not used",
  "is.front": "Front",
  "is.back": "Back",

  // Side effects
  "se.title": "Side effects",
  "se.subtitle": "Everything you've recorded, in relation to your doses.",
  "se.record": "Record side effect",
  "se.disclaimer":
    "This is a personal record, not a diagnosis. Severe or concerning symptoms should be discussed with a qualified healthcare professional.",
  "se.allRecords": "All records",
  "se.emptyDesc":
    "Records you add appear here with their severity and timing.",
  "se.timeline": "Timeline vs. doses",
  "se.noTimeline": "No timeline yet",
  "se.doseAt": "💉 {name} dose at {time}",
  "se.deleteTitle": "Delete record?",
  "se.deleteMessage": "This removes the side effect record permanently.",
  "se.dialogTitle": "Record side effect",
  "se.field": "Side effect",
  "se.choose": "Choose…",
  "se.other": "Other (type your own)",
  "se.describePh": "Describe the side effect",
  "se.severity": "Severity",
  "se.started": "Started",
  "se.ended": "Ended (optional)",
  "se.treatment": "Treatment (optional)",
  "se.notLinked": "Not linked",
  "se.notesPh": "Context, timing relative to the dose, what helped…",
  "se.professionalNote":
    "Severe or concerning symptoms should be discussed with a qualified healthcare professional.",
  "se.saveRecord": "Save record",
  "se.deleteRecordAria": "Delete {name} record",
  "se.editTitle": "Edit side effect",
  "se.editRecordAria": "Edit {name} record",

  // Calculator
  "calc.title": "Reconstitution calculator",
  "calc.subtitle":
    "A calculation tool based only on the values you enter — not medical guidance.",
  "calc.bacToAdd": "BAC water to add",
  "calc.vialQuantity": "Vial quantity",
  "calc.unit": "Unit",
  "calc.desiredConcentration": "Desired concentration",
  "calc.calculate": "Calculate",
  "calc.resultSuffix": "of bacteriostatic water to add to the vial.",
  "calc.perDose": "Volume to draw per dose at this concentration",
  "calc.recent": "Recent calculations",
  "calc.noCalcs": "No calculations yet",
  "calc.errZeroVial": "Vial quantity must be greater than zero.",
  "calc.errZeroConc": "Concentration must be greater than zero.",
  "calc.errInvalid": "These values do not produce a valid volume.",
  "calc.errTooLarge":
    "The resulting volume exceeds 1000 mL — check the concentration.",
  "calc.errGeneric": "Could not calculate with those values.",
  "calc.mode": "Calculation mode",
  "calc.modeConcentration": "By concentration",
  "calc.modeUnits": "By units",
  "calc.syringeType": "Syringe type",
  "calc.syringeTypeHint": "U-100 = 100 units per mL (the usual insulin syringe).",
  "calc.noSyringe": "Don't show units",
  "calc.unitsIntro":
    "Tell me the dose you want and which mark it should land on — this works out how much BAC water to reconstitute with.",
  "calc.iWantDose": "I want this dose",
  "calc.toEqualUnits": "to equal",
  "calc.targetRecap": "{dose} = {units} u on a {syringe} syringe",
  "calc.concentration": "Concentration",
  "calc.perUnit": "Per unit",
  "calc.dosesPerVial": "Doses per vial",
  "calc.exceedsBarrel":
    "That dose is over 1 mL, so it will not fit in a single insulin syringe. Use fewer units or a smaller dose.",
  "calc.suggestedBarrel": "Fits a {ml} mL syringe ({units} u full scale).",
  "calc.saveHint":
    "Save these numbers on the treatment (BAC water, syringe, expiry) so they stay recorded.",
  "calc.errZeroDose": "The dose must be greater than zero.",
  "calc.errZeroUnits": "The units must be greater than zero.",
  "calc.modeWeight": "By vial weight",
  "calc.weightIntro":
    "Weigh the vial before and after adding the water: the difference is the water that actually went in, which gives the vial's real concentration.",
  "calc.weightBefore": "Weight before (dry vial)",
  "calc.weightAfter": "Weight after (reconstituted)",
  "calc.weightUnit": "Weight unit",
  "calc.weightNote":
    "Bacteriostatic water weighs about 1 g per mL. Use a scale with 0.01 g precision and weigh the vial with its cap on both times.",
  "calc.weightRecap": "{after} − {before} = {added} of water",
  "calc.realConcentration": "Actual concentration of the vial.",
  "calc.waterAdded": "Water added",
  "calc.perMcgMl": "In mcg",
  "calc.errZeroWeight": "Both weights must be greater than zero.",
  "calc.errWeightOrder":
    "The weight after reconstituting must be greater than the weight before.",
  "calc.modeVolume": "By water",
  "calc.volumeIntro":
    "Enter how much bacteriostatic water you want to put in the vial and get the concentration that comes out of it.",
  "calc.waterToUse": "BAC water to use",
  "calc.volumeRecap": "{vial} in {ml} of water",
  "calc.resultingConcentration": "Resulting concentration with that water.",
  "calc.errZeroWater": "The amount of water must be greater than zero.",

  // Reconstitution on a treatment
  "recon.section": "Reconstitution",
  "recon.hint":
    "Optional: record how this vial was mixed so the concentration and dose in syringe units are always at hand.",
  "recon.bacWater": "BAC water added",
  "recon.syringe": "Syringe",
  "recon.noSyringe": "Not specified",
  "recon.reconstitutedAt": "Reconstituted on",
  "recon.expiresAt": "Vial expires on",
  "recon.suggestExpiry": "Use +{days} days",
  "recon.concentration": "Concentration: {value} mg/mL",
  "recon.doseEquals": "Your dose of {dose} = {units} u on a {syringe} syringe",
  "recon.doseInUnits": "Dose in units",

  // Vial expiry
  "vial.expiresLabel": "Vial expiry",
  "vial.expiresOn": "{name} — vial expires",
  "vial.expiresToday": "Expires today",
  "vial.expiresInDays": "In {days} days",
  "vial.expiredAgo": "Expired {days} days ago",
  "vial.reminderTitle": "Vial expiry reminders",
  "vial.reminderToggle": "Warn me before a vial expires",
  "vial.reminderWarn": "Warn me",
  "vial.warnSameDay": "On the expiry day",
  "vial.warnDays": "{days} days before",
  "vial.notifTitle": "Vial expiry",
  "vial.notifSoon": "{name}: the vial expires in {days} days.",
  "vial.notifToday": "{name}: the vial expires today.",
  "vial.notifExpired": "{name}: the vial has expired.",

  // History
  "hist.title": "History",
  "hist.subtitle":
    "Every recorded dose, filterable by treatment, date range, injection site, and status.",
  "hist.treatment": "Treatment",
  "hist.status": "Status",
  "hist.injectionSite": "Injection site",
  "hist.from": "From",
  "hist.to": "To",
  "hist.scheduled": "Scheduled",
  "hist.administered": "Administered",
  "hist.dose": "Dose",
  "hist.site": "Site",
  "hist.notes": "Notes",
  "hist.noMatch": "No doses match",
  "hist.noMatchDesc": "Try widening the filters.",

  // Settings
  "set.title": "Settings",
  "set.profile": "Profile",
  "set.displayName": "Display name",
  "set.yourName": "Your name",
  "set.language": "Language",
  "set.languageDesc": "Choose the language for the app.",
  "set.reminders": "Dose reminders",
  "set.noNotifications": "Notifications aren't available in this browser.",
  "set.remindUpcoming": "Remind me about upcoming doses",
  "set.blocked":
    "Notifications are blocked for this site — allow them in your browser settings to enable reminders.",
  "set.remindMe": "Remind me",
  "set.remindAt": "At the scheduled time",
  "set.remind5": "5 minutes before",
  "set.remind15": "15 minutes before",
  "set.remind30": "30 minutes before",
  "set.remind60": "1 hour before",
  "set.remindersNote":
    "Reminders are shown while the app is open in your browser. Support varies by platform — iOS requires the app to be installed to the home screen.",
  "set.app": "App",
  "set.install":
    "Install: use your browser's “Add to Home Screen” / “Install app” option for a full-screen experience.",
  "set.demoTitle": "Demo mode",
  "set.demoBody":
    "You're exploring with sample data stored only in this browser — no account or server involved. Add Supabase keys to .env.local to switch to a real backend.",
  "set.resetDemo": "Reset demo data",

  // Body-measurement metrics
  "metric.weight": "Weight",
  "metric.body_fat": "Body fat",
  "metric.muscle_mass": "Muscle mass",
  "metric.neck": "Neck",
  "metric.chest": "Chest",
  "metric.waist": "Waist",
  "metric.hips": "Hips",
  "metric.arms": "Arms",
  "metric.arm_left": "Left arm",
  "metric.arm_right": "Right arm",
  "metric.thighs": "Thighs",
  "metric.thigh_left": "Left thigh",
  "metric.thigh_right": "Right thigh",

  // Transition (body tracking)
  "trans.title": "Transition",
  "trans.subtitle": "Track your body composition and progress over time.",
  "trans.add": "New entry",
  "trans.addTitle": "New measurement",
  "trans.editTitle": "Edit measurement",
  "trans.date": "Date",
  "trans.composition": "Weight & composition",
  "trans.weightUnit": "Weight unit",
  "trans.muscleMass": "Muscle mass",
  "trans.bodyFatPct": "Body fat",
  "trans.circumferences": "Circumferences",
  "trans.lengthUnit": "Unit",
  "trans.photos": "Progress photos",
  "trans.addPhotos": "Add photos",
  "trans.processing": "Processing…",
  "trans.photosHint": "Up to {max} photos, stored privately with this entry.",
  "trans.photoAlt": "Progress photo {n}",
  "trans.notesPh": "How you feel, context for these numbers…",
  "trans.records": "Records",
  "trans.currentWeight": "Current weight",
  "trans.weightChange": "Weight change",
  "trans.entries": "Entries",
  "trans.noValues": "No values recorded for this entry.",
  "trans.emptyTitle": "No measurements yet",
  "trans.emptyDesc":
    "Add your weight and body measurements to start tracking your transition.",
  "trans.deleteTitle": "Delete measurement?",
  "trans.deleteMessage": "This permanently removes this entry and its photos.",
  "trans.reminderTitle": "Weigh-in reminders",
  "trans.reminderToggle": "Remind me to take measurements",
  "trans.reminderEvery": "Every",
  "trans.reminderTime": "Time",
  "trans.everyDay": "Every day",
  "trans.everyN": "Every {n} days",

  // Measurement reminder notification
  "mreminder.title": "Time to weigh in",
  "mreminder.body":
    "Log your weight and body measurements to keep your progress up to date.",

  // Statistics
  "stats.title": "Statistics",
  "stats.subtitle": "Your dose activity and body progress over time.",
  "stats.range": "Range",
  "stats.range30": "Last 30 days",
  "stats.range90": "Last 90 days",
  "stats.range365": "Last year",
  "stats.rangeAll": "All time",
  "stats.dosesCompleted": "Doses completed",
  "stats.dosesMissed": "Doses missed",
  "stats.metricTrend": "Body metric trend",
  "stats.metric": "Metric",
  "stats.dataPoints": "{n} data points",
  "stats.noMetricData": "No data for this metric",
  "stats.noMetricDesc":
    "Record measurements in Transition to see the trend here.",
  "stats.doseActivity": "Dose activity",
  "stats.noDoseData": "No dose activity in this range",
  "stats.addMeasurementsHint":
    "Tip: add measurements in Transition to unlock body-progress charts.",

  // Notification
  "notif.title": "Upcoming dose",
  "notif.at": "at",

  // Offline
  "off.title": "You're offline",
  "off.body":
    "Ascend Tracker needs a connection to load fresh data. Your records are safe — reconnect and try again.",

  // Validation (zod message keys)
  "val.emailInvalid": "Enter a valid email address",
  "val.passwordRequired": "Enter your password",
  "val.nameRequired": "Enter your name",
  "val.passwordMin": "Password must be at least 8 characters",
  "val.passwordsNoMatch": "Passwords do not match",
  "val.number": "Enter a number",
  "val.positive": "Must be greater than zero",
  "val.chooseDate": "Choose a date",
  "val.percentRange": "Must be between 0 and 100",
  "val.peptideName": "Enter the peptide name",
  "val.chooseStartDate": "Choose a start date",
  "val.wholeWeeks": "Whole weeks only",
  "val.atLeastWeek": "At least 1 week",
  "val.maxWeeks": "Maximum 104 weeks",
  "val.intervalMin": "At least every 2 days",
  "val.chooseTime": "Choose a time",
  "val.intervalRequired": "Enter the interval in days",
  "val.chooseDay": "Choose at least one day of the week",
  "val.chooseDateTime": "Choose a date and time",
  "val.tooLarge": "Value is too large",
  "val.chooseSideEffect": "Enter or choose a side effect",
  "val.chooseStart": "Choose when it started",
  "val.endAfterStart": "End must be after start",
  "val.expiryBeforeRecon":
    "The expiry date must come after the reconstitution date",
};

const es: Dict = {
  // Common
  "common.cancel": "Cancelar",
  "common.save": "Guardar",
  "common.saveChanges": "Guardar cambios",
  "common.saved": "Guardado ✓",
  "common.delete": "Eliminar",
  "common.edit": "Editar",
  "common.signIn": "Iniciar sesión",
  "common.signOut": "Cerrar sesión",
  "common.getStarted": "Empezar",
  "common.loading": "Cargando",
  "common.somethingWrong": "Algo salió mal.",
  "common.optional": "(opcional)",
  "common.all": "Todos",
  "common.viewAll": "Ver todo",
  "common.record": "Registrar",
  "common.backToSignIn": "Volver a iniciar sesión",
  "common.checkInbox": "Revisa tu correo",

  // Brand / nav
  "nav.dashboard": "Inicio",
  "nav.treatments": "Tratamientos",
  "nav.calendar": "Calendario",
  "nav.doses": "Dosis",
  "nav.injectionSites": "Zonas de inyección",
  "nav.sideEffects": "Efectos secundarios",
  "nav.transition": "Transición",
  "nav.stats": "Estadísticas",
  "nav.calculator": "Calculadora",
  "nav.history": "Historial",
  "nav.settings": "Ajustes",
  "nav.more": "Más",
  "nav.signedIn": "Sesión iniciada",
  "nav.recordDose": "Registrar una dosis",
  "nav.allSections": "Todas las secciones",

  // Statuses
  "status.scheduled": "programada",
  "status.completed": "completada",
  "status.missed": "omitida",
  "status.skipped": "saltada",
  "status.active": "activo",
  "status.paused": "pausado",
  "status.archived": "archivado",
  "severity.mild": "leve",
  "severity.moderate": "moderado",
  "severity.severe": "grave",

  // Status option labels
  "statusOpt.scheduled": "Programada",
  "statusOpt.completed": "Completada",
  "statusOpt.missed": "Omitida",
  "statusOpt.skipped": "Saltada",
  "severityOpt.mild": "Leve",
  "severityOpt.moderate": "Moderado",
  "severityOpt.severe": "Grave",

  // Weekdays (short) — 0 = domingo
  "weekday.0": "Dom",
  "weekday.1": "Lun",
  "weekday.2": "Mar",
  "weekday.3": "Mié",
  "weekday.4": "Jue",
  "weekday.5": "Vie",
  "weekday.6": "Sáb",

  // Injection site names
  "site.abdomen_upper_left": "Abdomen — superior izquierdo",
  "site.abdomen_upper_right": "Abdomen — superior derecho",
  "site.abdomen_lower_left": "Abdomen — inferior izquierdo",
  "site.abdomen_lower_right": "Abdomen — inferior derecho",
  "site.thigh_left": "Muslo — izquierdo",
  "site.thigh_right": "Muslo — derecho",
  "site.glute_left": "Glúteo — izquierdo",
  "site.glute_right": "Glúteo — derecho",
  "site.arm_left": "Brazo — izquierdo",
  "site.arm_right": "Brazo — derecho",

  // Common side effects
  "se.nausea": "Náuseas",
  "se.headache": "Dolor de cabeza",
  "se.fatigue": "Fatiga",
  "se.injectionRedness": "Enrojecimiento en la zona de inyección",
  "se.injectionPain": "Dolor en la zona de inyección",
  "se.dizziness": "Mareo",
  "se.constipation": "Estreñimiento",
  "se.diarrhea": "Diarrea",
  "se.appetite": "Pérdida de apetito",
  "se.bloating": "Hinchazón",
  "se.heartburn": "Acidez",

  // Landing
  "landing.heroTitle": "Un hogar tranquilo para tu protocolo de péptidos.",
  "landing.heroSubtitle":
    "Registra dosis, rota las zonas de inyección, anota efectos secundarios y observa tu progreso — organizado automáticamente según el calendario que definas.",
  "landing.createTracker": "Crea tu seguimiento",
  "landing.disclaimer":
    "Una herramienta de seguimiento y organización — no es asesoramiento médico.",
  "landing.feature.calendar.title": "Calendario automático",
  "landing.feature.calendar.desc":
    "Todo tu calendario de dosis, generado a partir del protocolo que configures.",
  "landing.feature.rotation.title": "Rotación de zonas",
  "landing.feature.rotation.desc":
    "Un mapa corporal recuerda dónde te inyectaste y sugiere la siguiente zona.",
  "landing.feature.math.title": "Cálculo de reconstitución",
  "landing.feature.math.desc":
    "Cálculos de agua bacteriostática a partir del tamaño del vial y la concentración deseada.",
  "landing.feature.progress.title": "Progreso e historial",
  "landing.feature.progress.desc":
    "Adherencia, dosis completadas y efectos secundarios — todo en un resumen sereno.",
  "landing.feature.reminders.title": "Recordatorios de dosis",
  "landing.feature.reminders.desc":
    "Notificaciones opcionales para que no se te pase una dosis programada.",
  "landing.feature.private.title": "Privado por diseño",
  "landing.feature.private.desc":
    "Tus datos son solo tuyos, protegidos con seguridad a nivel de fila.",
  "landing.footer":
    "Ascend Tracker — organiza un protocolo de tratamiento existente.",

  // Auth
  "auth.welcomeBack": "Bienvenido de nuevo",
  "auth.signInSubtitle": "Inicia sesión en tu seguimiento.",
  "auth.email": "Correo electrónico",
  "auth.password": "Contraseña",
  "auth.forgotPassword": "¿Olvidaste tu contraseña?",
  "auth.createAccount": "Crear cuenta",
  "auth.incorrectCredentials": "Correo o contraseña incorrectos.",
  "auth.demoTitle": "Modo demo",
  "auth.demoBody":
    "No necesitas cuenta — los campos ya están rellenados. Solo pulsa Iniciar sesión para explorar con datos de ejemplo guardados solo en este navegador.",
  "auth.createTitle": "Crea tu cuenta",
  "auth.createSubtitle": "Un espacio privado para tu protocolo.",
  "auth.name": "Nombre",
  "auth.confirmPassword": "Confirmar contraseña",
  "auth.min8": "Al menos 8 caracteres",
  "auth.repeatPassword": "Repite tu contraseña",
  "auth.confirmEmailBody":
    "Enviamos un enlace de confirmación a tu correo. Ábrelo para activar tu cuenta y luego inicia sesión.",
  "auth.haveAccount": "¿Ya tienes una cuenta?",
  "auth.resetTitle": "Restablece tu contraseña",
  "auth.resetSubtitle": "Introduce tu correo y te enviaremos un enlace.",
  "auth.resetSentBody":
    "Si existe una cuenta con ese correo, el enlace de restablecimiento está en camino.",
  "auth.sendResetLink": "Enviar enlace",
  "auth.newPasswordTitle": "Elige una nueva contraseña",
  "auth.newPasswordSubtitle":
    "Has iniciado sesión mediante tu enlace de restablecimiento — define una nueva contraseña abajo.",
  "auth.newPassword": "Nueva contraseña",
  "auth.repeatNewPassword": "Repite tu nueva contraseña",
  "auth.updatePassword": "Actualizar contraseña",
  "auth.resetExpired": "Este enlace ha caducado. Solicita uno nuevo.",

  // Dashboard
  "dash.morning": "Buenos días",
  "dash.afternoon": "Buenas tardes",
  "dash.evening": "Buenas noches",
  "dash.noTreatmentsTitle": "Aún no hay tratamientos",
  "dash.noTreatmentsDesc":
    "Crea tu primer protocolo de tratamiento y tu calendario de dosis se generará automáticamente.",
  "dash.createTreatment": "Crear tratamiento",
  "dash.nextDose": "Próxima dosis",
  "dash.markCompleted": "Marcar como completada",
  "dash.noUpcoming": "No hay dosis próximas programadas.",
  "dash.reviewTreatments": "Revisa tus tratamientos",
  "dash.treatmentProgress": "Progreso del tratamiento",
  "dash.weekOf": "Semana {n} de {total}",
  "dash.dosesOf": "{completed} de {total} dosis",
  "dash.noActive": "Sin tratamiento activo.",
  "dash.injectionSites": "Zonas de inyección",
  "dash.nextSuggested": "Siguiente sugerida: {name}",
  "dash.upcomingDoses": "Próximas dosis",
  "dash.nothingScheduled": "Nada programado",
  "dash.sideEffects": "Efectos secundarios",
  "dash.noSideEffects": "Sin efectos secundarios registrados",
  "dash.stat.completed": "Dosis completadas",
  "dash.stat.remaining": "Dosis restantes",
  "dash.stat.adherence": "Adherencia",
  "dash.stat.sitesUsed": "Zonas usadas",
  "dash.stat.sideEffects": "Efectos secundarios",
  "dash.sitesUsedValue": "{used} de {total}",

  // Treatments
  "tr.title": "Tratamientos",
  "tr.subtitle": "Tus protocolos y sus calendarios.",
  "tr.new": "Nuevo tratamiento",
  "tr.emptyDesc":
    "Crea un tratamiento y su calendario de dosis se generará a partir de tu programación.",
  "tr.createTreatment": "Crear tratamiento",
  "tr.freq.daily": "Diario",
  "tr.freq.everyN": "Cada {n} días",
  "tr.dosesOf": "{completed} de {total} dosis",
  "tr.started": "Iniciado el {date}",
  "tr.startedEnds": "Iniciado el {start} · termina el {end}",
  "tr.newSubtitle":
    "Introduce tu protocolo — el calendario de dosis se genera con estos parámetros.",

  // Treatment form
  "form.peptideName": "Nombre del péptido",
  "form.peptideNamePh": "p. ej. Retatrutida",
  "form.peptideHint":
    "Empieza a escribir y elige una sugerencia para autocompletar y ver su información.",
  "form.vialQuantity": "Cantidad del vial",
  "form.vialUnit": "Unidad del vial",
  "form.doseAmount": "Cantidad de dosis",
  "form.doseUnit": "Unidad de dosis",
  "form.startDate": "Fecha de inicio",
  "form.durationWeeks": "Duración (semanas)",
  "form.frequency": "Frecuencia",
  "form.freqEveryDay": "Todos los días",
  "form.freqEveryN": "Cada N días",
  "form.freqWeekdays": "Días concretos de la semana",
  "form.time": "Hora",
  "form.intervalDays": "Intervalo (días)",
  "form.intervalHint":
    "Una dosis cada tantos días, empezando en la fecha de inicio.",
  "form.daysOfWeek": "Días de la semana",
  "form.notes": "Notas",
  "form.notesTreatmentPh":
    "Detalles del protocolo, proveedor, lote, lo que te sea útil…",
  "form.schedulePreview":
    "Este calendario genera {n} dosis durante {weeks} semanas.",

  // Peptide reference
  "peptide.reference": "Referencia rápida",
  "peptide.function": "Función (atribuida online)",
  "peptide.dose": "Dosis (reportada por usuarios)",
  "peptide.frequency": "Frecuencia",
  "peptide.disclaimer":
    "Cifras anecdóticas recopiladas de reportes de usuarios en internet. No es consejo médico.",
  "peptide.empty": "Escribe o elige un péptido para ver su información de referencia.",

  // Treatment detail
  "trd.editTreatment": "Editar tratamiento",
  "trd.editHint":
    "Al cambiar el calendario se reconstruye. Las dosis que ya registraste se conservan; el resto se regenera para coincidir.",
  "trd.resume": "Reanudar",
  "trd.pause": "Pausar",
  "trd.completedStat": "Completadas",
  "trd.missedStat": "Omitidas",
  "trd.progressStat": "Progreso",
  "trd.ofDoses": "de {total} dosis",
  "trd.notes": "Notas",
  "trd.recentDoses": "Dosis recientes",
  "trd.noDoses": "No se generaron dosis.",
  "trd.deleteTitle": "¿Eliminar tratamiento?",
  "trd.deleteMessage":
    "Esto elimina permanentemente “{name}” y todo su historial de dosis. No se puede deshacer.",
  "trd.deleteConfirm": "Eliminar tratamiento",
  "trd.summary": "{amount} {unit} a las {time} · iniciado el {date}",

  // Calendar
  "cal.title": "Calendario",
  "cal.subtitle": "Dosis programadas, generadas a partir de tus tratamientos.",
  "cal.today": "Hoy",
  "cal.prevMonth": "Mes anterior",
  "cal.nextMonth": "Mes siguiente",
  "cal.noDosesDay": "No hay dosis este día",

  // Doses
  "dose.title": "Dosis",
  "dose.subtitle": "Lo que toca ahora y lo que viene esta semana.",
  "dose.dueNow": "Pendientes ahora",
  "dose.allCaughtUp": "Todo al día",
  "dose.allCaughtUpDesc": "No hay dosis esperando a registrarse.",
  "dose.next7": "Próximos 7 días",
  "dose.nothingScheduledDesc":
    "Las dosis aparecen aquí cuando hay un tratamiento activo.",
  "dose.notYetAvailable":
    "Disponible el día de la dosis (solo hoy o mañana).",

  // Record page
  "rec.title": "Registrar una dosis",
  "rec.subtitle": "Elige la dosis programada que acabas de administrar.",
  "rec.recorded": "Dosis registrada.",
  "rec.nothingTitle": "Nada que registrar",
  "rec.nothingDesc":
    "No hay dosis programadas. Crea o reanuda un tratamiento primero.",

  // Record dose dialog
  "rdd.title": "Registrar dosis — {name}",
  "rdd.amount": "Cantidad",
  "rdd.unit": "Unidad",
  "rdd.administeredAt": "Administrada el",
  "rdd.injectionSite": "Zona de inyección",
  "rdd.suggested": "Sugerida: {name}",
  "rdd.noSite": "Sin zona registrada",
  "rdd.notesPh": "Algo que recordar sobre esta dosis…",
  "rdd.markCompleted": "Marcar como completada",

  // Edit dose dialog
  "edd.title": "Editar dosis — {name}",
  "edd.scheduledFor": "Programada para",
  "edd.notesPh": "Notas para esta dosis…",
  "edd.skip": "Saltar esta dosis",
  "edd.restore": "Restaurar a programada",

  // Injection sites
  "is.title": "Zonas de inyección",
  "is.subtitle": "Historial de rotación y qué zonas están disponibles.",
  "is.bodyMap": "Mapa corporal",
  "is.allAreas": "Todas las zonas",
  "is.noSites": "No hay zonas configuradas",
  "is.usedRecently": "Usada recientemente",
  "is.ready": "Lista",
  "is.notUsed": "No usada",
  "is.injections": "{n} inyecciones",
  "is.injectionsLastUsed": "{n} inyecciones · usada por última vez {day}",
  "is.available": "Disponible",
  "is.legendRecent": "Usada recientemente",
  "is.legendUsed": "Usada",
  "is.legendNotUsed": "No usada",
  "is.front": "Frente",
  "is.back": "Espalda",

  // Side effects
  "se.title": "Efectos secundarios",
  "se.subtitle": "Todo lo que has registrado, en relación con tus dosis.",
  "se.record": "Registrar efecto secundario",
  "se.disclaimer":
    "Este es un registro personal, no un diagnóstico. Los síntomas graves o preocupantes deben consultarse con un profesional sanitario cualificado.",
  "se.allRecords": "Todos los registros",
  "se.emptyDesc":
    "Los registros que añadas aparecen aquí con su gravedad y su momento.",
  "se.timeline": "Cronología frente a dosis",
  "se.noTimeline": "Aún no hay cronología",
  "se.doseAt": "💉 Dosis de {name} a las {time}",
  "se.deleteTitle": "¿Eliminar registro?",
  "se.deleteMessage": "Esto elimina el registro del efecto secundario de forma permanente.",
  "se.dialogTitle": "Registrar efecto secundario",
  "se.field": "Efecto secundario",
  "se.choose": "Elige…",
  "se.other": "Otro (escríbelo)",
  "se.describePh": "Describe el efecto secundario",
  "se.severity": "Gravedad",
  "se.started": "Comenzó",
  "se.ended": "Terminó (opcional)",
  "se.treatment": "Tratamiento (opcional)",
  "se.notLinked": "Sin vincular",
  "se.notesPh": "Contexto, momento respecto a la dosis, qué ayudó…",
  "se.professionalNote":
    "Los síntomas graves o preocupantes deben consultarse con un profesional sanitario cualificado.",
  "se.saveRecord": "Guardar registro",
  "se.deleteRecordAria": "Eliminar el registro de {name}",
  "se.editTitle": "Editar efecto secundario",
  "se.editRecordAria": "Editar el registro de {name}",

  // Calculator
  "calc.title": "Calculadora de reconstitución",
  "calc.subtitle":
    "Una herramienta de cálculo basada solo en los valores que introduces — no es orientación médica.",
  "calc.bacToAdd": "Agua bacteriostática a añadir",
  "calc.vialQuantity": "Cantidad del vial",
  "calc.unit": "Unidad",
  "calc.desiredConcentration": "Concentración deseada",
  "calc.calculate": "Calcular",
  "calc.resultSuffix": "de agua bacteriostática a añadir al vial.",
  "calc.perDose": "Volumen a extraer por dosis a esta concentración",
  "calc.recent": "Cálculos recientes",
  "calc.noCalcs": "Aún no hay cálculos",
  "calc.errZeroVial": "La cantidad del vial debe ser mayor que cero.",
  "calc.errZeroConc": "La concentración debe ser mayor que cero.",
  "calc.errInvalid": "Estos valores no producen un volumen válido.",
  "calc.errTooLarge":
    "El volumen resultante supera los 1000 mL — revisa la concentración.",
  "calc.errGeneric": "No se pudo calcular con esos valores.",
  "calc.mode": "Modo de cálculo",
  "calc.modeConcentration": "Por concentración",
  "calc.modeUnits": "Por unidades",
  "calc.syringeType": "Tipo de jeringa",
  "calc.syringeTypeHint":
    "U-100 = 100 unidades por mL (la jeringa de insulina habitual).",
  "calc.noSyringe": "No mostrar unidades",
  "calc.unitsIntro":
    "Indica la dosis que quieres y en qué marca debe quedar: calculamos con cuánta agua bacteriostática reconstituir el vial.",
  "calc.iWantDose": "Quiero que esta dosis",
  "calc.toEqualUnits": "sea igual a",
  "calc.targetRecap": "{dose} = {units} u en jeringa {syringe}",
  "calc.concentration": "Concentración",
  "calc.perUnit": "Por unidad",
  "calc.dosesPerVial": "Dosis por vial",
  "calc.exceedsBarrel":
    "Esa dosis supera 1 mL, así que no entra en una sola jeringa de insulina. Usa menos unidades o una dosis menor.",
  "calc.suggestedBarrel": "Entra en una jeringa de {ml} mL ({units} u de escala).",
  "calc.saveHint":
    "Guarda estos datos en el tratamiento (agua bacteriostática, jeringa, caducidad) para que queden registrados.",
  "calc.errZeroDose": "La dosis debe ser mayor que cero.",
  "calc.errZeroUnits": "Las unidades deben ser mayores que cero.",
  "calc.modeWeight": "Por peso del vial",
  "calc.weightIntro":
    "Pesa el vial antes y después de añadir el agua: la diferencia es el agua que realmente entró, y con eso sale la concentración real del vial.",
  "calc.weightBefore": "Peso antes (sin reconstituir)",
  "calc.weightAfter": "Peso después (reconstituido)",
  "calc.weightUnit": "Unidad de peso",
  "calc.weightNote":
    "El agua bacteriostática pesa aproximadamente 1 g por mL. Usa una báscula con precisión de 0.01 g y pesa el vial con su tapa las dos veces.",
  "calc.weightRecap": "{after} − {before} = {added} de agua",
  "calc.realConcentration": "Concentración real del vial.",
  "calc.waterAdded": "Agua añadida",
  "calc.perMcgMl": "En mcg",
  "calc.errZeroWeight": "Ambos pesos deben ser mayores que cero.",
  "calc.errWeightOrder":
    "El peso después de reconstituir debe ser mayor que el peso antes.",
  "calc.modeVolume": "Por agua",
  "calc.volumeIntro":
    "Indica cuánta agua bacteriostática quieres poner en el vial y obtén la concentración que resulta.",
  "calc.waterToUse": "Agua bacteriostática a usar",
  "calc.volumeRecap": "{vial} en {ml} de agua",
  "calc.resultingConcentration": "Concentración resultante con esa agua.",
  "calc.errZeroWater": "La cantidad de agua debe ser mayor que cero.",

  // Reconstitución en el tratamiento
  "recon.section": "Reconstitución",
  "recon.hint":
    "Opcional: registra cómo se preparó el vial para tener siempre a mano la concentración y la dosis en unidades.",
  "recon.bacWater": "Agua bacteriostática añadida",
  "recon.syringe": "Jeringa",
  "recon.noSyringe": "Sin especificar",
  "recon.reconstitutedAt": "Reconstituido el",
  "recon.expiresAt": "El vial vence el",
  "recon.suggestExpiry": "Usar +{days} días",
  "recon.concentration": "Concentración: {value} mg/mL",
  "recon.doseEquals": "Tu dosis de {dose} = {units} u en jeringa {syringe}",
  "recon.doseInUnits": "Dosis en unidades",

  // Vencimiento del vial
  "vial.expiresLabel": "Vencimiento de vial",
  "vial.expiresOn": "{name} — vence el vial",
  "vial.expiresToday": "Vence hoy",
  "vial.expiresInDays": "En {days} días",
  "vial.expiredAgo": "Venció hace {days} días",
  "vial.reminderTitle": "Recordatorios de vencimiento",
  "vial.reminderToggle": "Avisarme antes de que venza un vial",
  "vial.reminderWarn": "Avisarme",
  "vial.warnSameDay": "El día del vencimiento",
  "vial.warnDays": "{days} días antes",
  "vial.notifTitle": "Vencimiento de vial",
  "vial.notifSoon": "{name}: el vial vence en {days} días.",
  "vial.notifToday": "{name}: el vial vence hoy.",
  "vial.notifExpired": "{name}: el vial ya venció.",

  // History
  "hist.title": "Historial",
  "hist.subtitle":
    "Cada dosis registrada, filtrable por tratamiento, rango de fechas, zona de inyección y estado.",
  "hist.treatment": "Tratamiento",
  "hist.status": "Estado",
  "hist.injectionSite": "Zona de inyección",
  "hist.from": "Desde",
  "hist.to": "Hasta",
  "hist.scheduled": "Programada",
  "hist.administered": "Administrada",
  "hist.dose": "Dosis",
  "hist.site": "Zona",
  "hist.notes": "Notas",
  "hist.noMatch": "Ninguna dosis coincide",
  "hist.noMatchDesc": "Prueba a ampliar los filtros.",

  // Settings
  "set.title": "Ajustes",
  "set.profile": "Perfil",
  "set.displayName": "Nombre visible",
  "set.yourName": "Tu nombre",
  "set.language": "Idioma",
  "set.languageDesc": "Elige el idioma de la aplicación.",
  "set.reminders": "Recordatorios de dosis",
  "set.noNotifications": "Las notificaciones no están disponibles en este navegador.",
  "set.remindUpcoming": "Recordarme las próximas dosis",
  "set.blocked":
    "Las notificaciones están bloqueadas para este sitio — permítelas en los ajustes de tu navegador para activar los recordatorios.",
  "set.remindMe": "Recordarme",
  "set.remindAt": "A la hora programada",
  "set.remind5": "5 minutos antes",
  "set.remind15": "15 minutos antes",
  "set.remind30": "30 minutos antes",
  "set.remind60": "1 hora antes",
  "set.remindersNote":
    "Los recordatorios se muestran mientras la app está abierta en tu navegador. El soporte varía según la plataforma — en iOS la app debe estar instalada en la pantalla de inicio.",
  "set.app": "Aplicación",
  "set.install":
    "Instalar: usa la opción “Añadir a pantalla de inicio” / “Instalar app” de tu navegador para una experiencia a pantalla completa.",
  "set.demoTitle": "Modo demo",
  "set.demoBody":
    "Estás explorando con datos de ejemplo guardados solo en este navegador — sin cuenta ni servidor. Añade las claves de Supabase a .env.local para cambiar a un backend real.",
  "set.resetDemo": "Restablecer datos de demo",

  // Body-measurement metrics
  "metric.weight": "Peso",
  "metric.body_fat": "Grasa corporal",
  "metric.muscle_mass": "Masa muscular",
  "metric.neck": "Cuello",
  "metric.chest": "Pecho",
  "metric.waist": "Cintura",
  "metric.hips": "Cadera",
  "metric.arms": "Brazos",
  "metric.arm_left": "Brazo izquierdo",
  "metric.arm_right": "Brazo derecho",
  "metric.thighs": "Muslos",
  "metric.thigh_left": "Muslo izquierdo",
  "metric.thigh_right": "Muslo derecho",

  // Transition (seguimiento corporal)
  "trans.title": "Transición",
  "trans.subtitle":
    "Sigue tu composición corporal y tu progreso a lo largo del tiempo.",
  "trans.add": "Nueva medición",
  "trans.addTitle": "Nueva medición",
  "trans.editTitle": "Editar medición",
  "trans.date": "Fecha",
  "trans.composition": "Peso y composición",
  "trans.weightUnit": "Unidad de peso",
  "trans.muscleMass": "Masa muscular",
  "trans.bodyFatPct": "Grasa corporal",
  "trans.circumferences": "Circunferencias",
  "trans.lengthUnit": "Unidad",
  "trans.photos": "Fotos de progreso",
  "trans.addPhotos": "Añadir fotos",
  "trans.processing": "Procesando…",
  "trans.photosHint":
    "Hasta {max} fotos, guardadas de forma privada con este registro.",
  "trans.photoAlt": "Foto de progreso {n}",
  "trans.notesPh": "Cómo te sientes, contexto de estos números…",
  "trans.records": "Registros",
  "trans.currentWeight": "Peso actual",
  "trans.weightChange": "Cambio de peso",
  "trans.entries": "Registros",
  "trans.noValues": "No hay valores en este registro.",
  "trans.emptyTitle": "Aún no hay mediciones",
  "trans.emptyDesc":
    "Añade tu peso y medidas corporales para empezar a seguir tu transición.",
  "trans.deleteTitle": "¿Eliminar medición?",
  "trans.deleteMessage":
    "Esto elimina permanentemente este registro y sus fotos.",
  "trans.reminderTitle": "Recordatorios de medición",
  "trans.reminderToggle": "Recordarme tomar medidas",
  "trans.reminderEvery": "Cada",
  "trans.reminderTime": "Hora",
  "trans.everyDay": "Todos los días",
  "trans.everyN": "Cada {n} días",

  // Notificación de medición
  "mreminder.title": "Hora de pesarte",
  "mreminder.body":
    "Registra tu peso y medidas corporales para mantener tu progreso al día.",

  // Estadísticas
  "stats.title": "Estadísticas",
  "stats.subtitle":
    "Tu actividad de dosis y tu progreso corporal a lo largo del tiempo.",
  "stats.range": "Rango",
  "stats.range30": "Últimos 30 días",
  "stats.range90": "Últimos 90 días",
  "stats.range365": "Último año",
  "stats.rangeAll": "Todo el tiempo",
  "stats.dosesCompleted": "Dosis completadas",
  "stats.dosesMissed": "Dosis omitidas",
  "stats.metricTrend": "Tendencia de medida corporal",
  "stats.metric": "Medida",
  "stats.dataPoints": "{n} puntos de datos",
  "stats.noMetricData": "Sin datos para esta medida",
  "stats.noMetricDesc":
    "Registra mediciones en Transición para ver la tendencia aquí.",
  "stats.doseActivity": "Actividad de dosis",
  "stats.noDoseData": "Sin actividad de dosis en este rango",
  "stats.addMeasurementsHint":
    "Consejo: añade mediciones en Transición para desbloquear las gráficas de progreso corporal.",

  // Notification
  "notif.title": "Próxima dosis",
  "notif.at": "a las",

  // Offline
  "off.title": "Estás sin conexión",
  "off.body":
    "Ascend Tracker necesita conexión para cargar datos actualizados. Tus registros están a salvo — vuelve a conectarte e inténtalo de nuevo.",

  // Validation
  "val.emailInvalid": "Introduce un correo válido",
  "val.passwordRequired": "Introduce tu contraseña",
  "val.nameRequired": "Introduce tu nombre",
  "val.passwordMin": "La contraseña debe tener al menos 8 caracteres",
  "val.passwordsNoMatch": "Las contraseñas no coinciden",
  "val.number": "Introduce un número",
  "val.positive": "Debe ser mayor que cero",
  "val.chooseDate": "Elige una fecha",
  "val.percentRange": "Debe estar entre 0 y 100",
  "val.peptideName": "Introduce el nombre del péptido",
  "val.chooseStartDate": "Elige una fecha de inicio",
  "val.wholeWeeks": "Solo semanas completas",
  "val.atLeastWeek": "Al menos 1 semana",
  "val.maxWeeks": "Máximo 104 semanas",
  "val.intervalMin": "Al menos cada 2 días",
  "val.chooseTime": "Elige una hora",
  "val.intervalRequired": "Introduce el intervalo en días",
  "val.chooseDay": "Elige al menos un día de la semana",
  "val.chooseDateTime": "Elige una fecha y hora",
  "val.tooLarge": "El valor es demasiado grande",
  "val.chooseSideEffect": "Introduce o elige un efecto secundario",
  "val.chooseStart": "Elige cuándo comenzó",
  "val.endAfterStart": "El final debe ser posterior al inicio",
  "val.expiryBeforeRecon":
    "La fecha de vencimiento debe ser posterior a la de reconstitución",
};

export const translations: Record<Locale, Dict> = { en, es };

export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>
): string {
  const dict = translations[locale] ?? translations.es;
  let text = dict[key] ?? translations.es[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${name}\\}`, "g"), String(value));
    }
  }
  return text;
}
