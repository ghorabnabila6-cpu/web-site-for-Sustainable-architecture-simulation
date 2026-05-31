 <?php
// backend/login.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Options database connection pour XAMPP local
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "simarch_db";

// Connexion mysqli (Port 3307)
$conn = new mysqli($servername, $username, $password, $dbname, 3307);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erreur de connexion MySQL : " . $conn->connect_error]));
}

// Récupération du body JSON de l'application React
$data = json_decode(file_get_contents("php://input"));

if(isset($data->email) && isset($data->password)) {
    $email = $conn->real_escape_string($data->email);
    $pass = $conn->real_escape_string($data->password);

    // Requête pour vérifier les identifiants
    $sql = "SELECT id, email, role FROM users WHERE email='$email' AND password='$pass'";
    $result = $conn->query($sql);

    // Résultat
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode(["success" => true, "user" => $row]);
    } else {
        echo json_encode(["success" => false, "message" => "Identifiants ou mot de passe incorrects."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Veuillez remplir email et mot de passe."]);
}

$conn->close();
?>
