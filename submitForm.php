
<?php

	$email_to = $_POST['recipient'];
    $email_subject = $_POST['subject'];


    $first_name = $_POST['first_name']; 
    $last_name = $_POST['last_name']; 
    $email_from = $_POST['email']; 
    $educator = $_POST['educator']; 
    $zip = $_POST['zip']; 
	$study = $_POST['study'];
    $degrees = $_POST['degrees']; 
	$website = $_POST['website']; 
    $whenwhere = $_POST['whenwhere'];
	$image = $_POST['image'];
	$message = $_POST['message'];

	$error_message = "";
    $email_exp = '/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/';
	
	//make sure email does not have inappropriate characters.
	//might want to do this for all variables for security
	if(!preg_match($email_exp,$email_from)) {
		$error_message .= 'The Email Address you entered does not appear to be valid.<br />';
    }
	function clean_string($string) {
		$bad = array("content-type","bcc:","to:","cc:","href");
		return str_replace($bad,"",$string);
    }
     
	$email_message = "First Name: ".clean_string($first_name)."\n";
    $email_message .= "Last Name: ".clean_string($last_name)."\n";
    $email_message .= "Email: ".clean_string($email_from)."\n";
    $email_message .= "Are you an Educator: ".clean_string($educator)."\n";
	$email_message .= "When & Where: ".clean_string($whenwhere)."\n";
    $email_message .= "Current zip/POSTal code: ".clean_string($zip)."\n";
    $email_message .= "Major/Field of Study: ".clean_string($study)."\n";
    $email_message .= "Degrees: ".clean_string($degrees)."\n";
    $email_message .= "Website: ".clean_string($website)."\n";
  
  //  $email_message .= "Have any photos with you and Jules Engel that you would like to share?: ".clean_string($website)."\n";
    $email_message .= "Please talk about your experience with Jules Engel and how:\n".clean_string($message)."\n";
	
	

// create email headers
$headers = 'From: '.$email_from."\r\n".
'X-Mailer: PHP/' . phpversion();
@mail($email_to, $email_subject, $email_message, $headers);  

Util::redirect('index.html');
?>
 
