import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationPayload {
  announcement_id: string;
  title: string;
  message: string;
  target_class: string;
  teacher_phone: string;
}

interface StudentRecord {
  phone: string;
  student_name: string;
  class: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const fast2smsApiKey = Deno.env.get("FAST2SMS_API_KEY")!;

    const body: NotificationPayload = await req.json();
    const { announcement_id, title, message, target_class, teacher_phone } = body;

    // Fetch students for the target class
    const studentsUrl = target_class === "all"
      ? `${supabaseUrl}/rest/v1/approved_students?select=phone,student_name,class`
      : `${supabaseUrl}/rest/v1/approved_students?select=phone,student_name,class&class=eq.${encodeURIComponent(target_class)}`;

    const studentsResp = await fetch(studentsUrl, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    if (!studentsResp.ok) {
      throw new Error(`Failed to fetch students: ${studentsResp.status}`);
    }

    const students: StudentRecord[] = await studentsResp.json();

    if (students.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No students found for this class" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create notification records and send SMS
    let sentCount = 0;
    const notificationPromises = students.map(async (student) => {
      try {
        // Create notification record
        const notifResp = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
          method: "POST",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            student_phone: student.phone,
            student_name: student.student_name,
            announcement_id,
            type: "announcement",
            message: `${title}: ${message}`,
            delivered: false,
          }),
        });

        // Send SMS via Fast2SMS
        if (fast2smsApiKey) {
          const smsResp = await fetch("https://www.fast2sms.com/dev/bulkV2", {
            method: "POST",
            headers: {
              authorization: fast2smsApiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              route: "q",
              message: `Pathshala: ${title} - ${message}`,
              numbers: student.phone,
            }),
          });

          if (smsResp.ok) {
            // Mark notification as delivered
            const notifData = await notifResp.json();
            if (notifData && notifData[0]?.id) {
              await fetch(`${supabaseUrl}/rest/v1/notifications?id=eq.${notifData[0].id}`, {
                method: "PATCH",
                headers: {
                  apikey: serviceRoleKey,
                  Authorization: `Bearer ${serviceRoleKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  delivered: true,
                  delivered_at: new Date().toISOString(),
                }),
              });
            }
            sentCount++;
          }
        }
      } catch (err) {
        console.error(`Failed for student ${student.phone}:`, err);
      }
    });

    await Promise.allSettled(notificationPromises);

    return new Response(
      JSON.stringify({
        sent: sentCount,
        total: students.length,
        message: `Notifications sent to ${sentCount}/${students.length} students`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("send-notifications error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send notifications" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
