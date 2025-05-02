package Website_tester.develop.service;

import Website_tester.develop.RequestClass.Encrypted;
import Website_tester.develop.model.RegisterDetails;
import Website_tester.develop.repository.UserDetailsRepo;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.util.Base64;

@Service
public class MailSenderServiceImpl implements MailSenderService{

    @Autowired
    private JavaMailSender javaMailSender;

    @Autowired
    private UserDetailsRepo userDetailsRepo;

    private SecretKey secretKey;
    private String encryptedCode;

    @PostConstruct
    public void initKey() throws Exception{
        KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
        keyGenerator.init(128);
        secretKey = keyGenerator.generateKey();
    }

    private String encrypt(String text) throws Exception{
        Cipher cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.ENCRYPT_MODE,secretKey);
        byte[] encrypted = cipher.doFinal(text.getBytes());

        return Base64.getEncoder().encodeToString(encrypted);
    }

    @Override
    public String generateCode(String email, String number) throws Exception {

        RegisterDetails user = userDetailsRepo.findByEmail(email);
        if(user == null){
            return "User not Found";
        }

        String mail = user.getEmail();
        encryptedCode = encrypt(number);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("errordetector.extension@gmail.com");
        message.setTo(mail);
        message.setSubject("Your Secured Code");
        message.setText("Encrypted Code: \n\n"+ encryptedCode);

        javaMailSender.send(message);

        System.out.println("String Generated.......!");
        return "Encrypted code sent to Gmail : "+mail;
    }

    @Override
    public String verifyCode(Encrypted encrypted) {

        if(encrypted.getEncrypted() == null){
           return "Encrypted String is Empty....!";
        }

        if(encrypted.getEncrypted().equals(encryptedCode)){
            return "Encrypted String is Verified.....!";
        }
        else{
            return "Please check Encrypted String";
        }

    }
}
