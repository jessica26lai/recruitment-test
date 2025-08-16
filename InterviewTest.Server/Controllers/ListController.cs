using InterviewTest.Server.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;

namespace InterviewTest.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ListController : ControllerBase
    {


        [HttpPost("add")]
        public IActionResult Add([FromBody] Employee employee)
        {
            if (string.IsNullOrWhiteSpace(employee.Name))
                return BadRequest("Name is required");

            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();

                // Check if employee with the same name already exists
                var checkCmd = connection.CreateCommand();
                checkCmd.CommandText = @"SELECT COUNT(*) FROM Employees WHERE LOWER(Name) = LOWER(@name);";
                checkCmd.Parameters.AddWithValue("@name", employee.Name);

                var exists = Convert.ToInt32(checkCmd.ExecuteScalar());
                if (exists > 0)
                    return BadRequest($"Employee with name '{employee.Name}' already exists.");

                // Insert new employee
                var insertCmd = connection.CreateCommand();
                insertCmd.CommandText = @"INSERT INTO Employees (Name, Value) VALUES (@name, @value)";
                insertCmd.Parameters.AddWithValue("@name", employee.Name);
                insertCmd.Parameters.AddWithValue("@value", employee.Value);

                insertCmd.ExecuteNonQuery();
            }

            return Ok(employee);
        }

        [HttpPut("update/{name}")]
        public IActionResult Update(string name, [FromBody] Employee employee)
        {
            if (string.IsNullOrWhiteSpace(name))
                return BadRequest("Original name is required");

            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();

                //update employee with the given name
                var updateCmd = connection.CreateCommand();
                updateCmd.CommandText = @"UPDATE Employees SET Name=@newName, Value=@value WHERE Name=@oldName";
                updateCmd.Parameters.AddWithValue("@newName", employee.Name);
                updateCmd.Parameters.AddWithValue("@value", employee.Value);
                updateCmd.Parameters.AddWithValue("@oldName", name);

                int rowsAffected = updateCmd.ExecuteNonQuery();
                if (rowsAffected == 0)
                    return NotFound("Employee not found");
            }

            return Ok(employee);
        }

        [HttpDelete("delete/{name}")]
        public IActionResult Remove(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return BadRequest("Name is required");

            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();

                //delete employee with the given name
                var deleteCmd = connection.CreateCommand();
                deleteCmd.CommandText = @"DELETE FROM Employees WHERE Name=@name";
                deleteCmd.Parameters.AddWithValue("@name", name);

                int rowsAffected = deleteCmd.ExecuteNonQuery();
                if (rowsAffected == 0)
                    return NotFound("Employee not found");
            }

            return Ok();
        }

        [HttpPost("increment-values")]
        public IActionResult IncrementValues()
        {
            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();

                //Increment the field Value by 1 where the field Name starts with ‘E’, by 10 where Name starts with ‘G’ and all others by 100.
                var updateCmd = connection.CreateCommand();
                updateCmd.CommandText = @"
                                            UPDATE Employees
                                            SET Value = Value + CASE 
                                                WHEN Name LIKE 'E%' THEN 1
                                                WHEN Name LIKE 'G%' THEN 10
                                                ELSE 100
                                            END
                                        ";
                updateCmd.ExecuteNonQuery();
            }

            return Ok("Increment completed");
        }

        [HttpGet("sum-abc")]
        public List<Employee> GetSumABC()
        {
            var sumABC = new List<Employee>();

            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();

                var selectCmd = connection.CreateCommand();
                // List the sum of all Values for all Names that begin with A, B or C but only present the data where the summed values are greater than or equal to 11171
                selectCmd.CommandText = @"
                    SELECT SUBSTR(name, 1, 1) AS Inital, SUM(Value) AS TotalValue FROM Employees WHERE SUBSTR(name, 1, 1) IN ('A', 'B', 'C') GROUP BY Inital HAVING SUM(Value) >= 11171
                    ";

                using (var reader = selectCmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        sumABC.Add(new Employee
                        {
                            Name = reader.GetString(0),
                            Value = reader.GetInt32(1)
                        });
                    }
                }
                
            }

            return sumABC;
        }


        /*
         * List API methods goe here
         * */
    }
}
