import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: "little_but_loud",
});

try {
  const [rows] = await connection.execute(
    "SELECT id, name, email FROM members WHERE name = ?",
    ["Test123"]
  );

  console.log("\n=== Test123 Member Details ===");
  console.log("Query result:", rows);

  if (rows.length > 0) {
    const member = rows[0];
    console.log("\nMember found:");
    console.log("  ID:", member.id);
    console.log("  Name:", member.name);
    console.log("  Email:", member.email);
    console.log("  Email type:", typeof member.email);
    console.log("  Email is null:", member.email === null);
    console.log("  Email is undefined:", member.email === undefined);

    if (!member.email) {
      console.error("\n❌ PROBLEM: Test123 has NO email address!");
      console.error("This is why connection request emails are not being sent.");
      console.error("The router checks 'if (member.email)' and skips email sending if it's null/empty.");
      console.error("\nSOLUTION: Update Test123's email address in the database.");
    } else {
      console.log("\n✅ Test123 has email:", member.email);
    }
  } else {
    console.error("Test123 member not found!");
  }
} finally {
  await connection.end();
}
