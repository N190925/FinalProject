package Website_tester.develop.controller;


import Website_tester.develop.RequestClass.Encrypted;
import Website_tester.develop.RequestClass.UserRegister;
import Website_tester.develop.RequestClass.UserVerification;
import Website_tester.develop.service.DownloadService;
import Website_tester.develop.service.MailSenderService;
import Website_tester.develop.service.UserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Arrays;

@Controller
@RequestMapping("/errordetector")
@CrossOrigin(origins = {"http://127.0.0.1:5500"},
        allowCredentials = "true")
public class DownloadZip {

    @Autowired
    private DownloadService downloadService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private MailSenderService mailSenderService;

    @PostMapping("/register")
    public ResponseEntity<String> saveDetails(@RequestBody UserRegister userRegister){
        return ResponseEntity.ok().body(userDetailsService.saveUser(userRegister));
    }

    @PostMapping("/login")
    public ResponseEntity<String> getLogin(@RequestBody UserVerification userVerification){
        return ResponseEntity.ok().body(userDetailsService.checkDetails(userVerification));
    }

    @GetMapping("/download")
    public ResponseEntity<InputStreamResource> getZipFile() throws IOException {

        File file = downloadService.userVerification();

        InputStreamResource resource = new InputStreamResource(new FileInputStream(file));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "Zip File = "+file.getName())
                .contentType(MediaType.parseMediaType("application/zip"))
                .contentLength(file.length())
                .body(resource);
    }

    @GetMapping("/send")
    public ResponseEntity<String> sendEncryptedCode(@RequestParam String email){
        try{
            String code = "190925";
            return ResponseEntity.ok().body(mailSenderService.generateCode(email,code));
        }
        catch (Exception e){
            return ResponseEntity.ok().body("Error :"+ Arrays.toString(e.getStackTrace()));
        }

    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyEncryptedCode(@RequestBody Encrypted encrypted){
        return ResponseEntity.ok().body(mailSenderService.verifyCode(encrypted));
    }
}
