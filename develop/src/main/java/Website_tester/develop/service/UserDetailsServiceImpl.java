package Website_tester.develop.service;

import Website_tester.develop.RequestClass.UserRegister;
import Website_tester.develop.RequestClass.UserVerification;
import Website_tester.develop.model.RegisterDetails;
import Website_tester.develop.repository.UserDetailsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

@Service
public class UserDetailsServiceImpl implements UserDetailsService{

    @Autowired
    private JavaMailSender javaMailSender;

    private SecretKey secretKey;

    @Autowired
    private UserDetailsRepo userDetailsRepo;

    @Override
    public String checkDetails(UserVerification userVerification) {

        String userName = userVerification.getEmail();
        String password = userVerification.getPassword();

        String credentials1 = userDetailsRepo.findByUser(userName);
        if(credentials1 == null){
            throw new RuntimeException("UserName was not found.....!");
        }

        String credentials2 = userDetailsRepo.findByPass(password);
        if(credentials2 == null){
            throw new RuntimeException("Password was not found.....!");
        }

        if(userName.equals(credentials1)){

            if(password.equals(credentials2)){

                System.out.println("UserDetails are verified successfully.......!");
            }
            else{
                throw new RuntimeException("Password is not valid.......!");
            }
        }
        else{
            throw new RuntimeException("Password is not valid.......!");
        }

        return "";
    }

    @Override
    public String saveUser(UserRegister userRegister) {

        if(userRegister.getEmail() == null){
            throw new RuntimeException("Email Address is not Existed.....!");
        }

        RegisterDetails user = userDetailsRepo.findByEmail(
                userRegister.getEmail()
        );

        String code = null;
        if(user == null){
            user = new RegisterDetails();
            user.setEmail(userRegister.getEmail());
            user.setUserName(userRegister.getUserName());
            user.setPassword(userRegister.getPassword());

            userDetailsRepo.save(user);
            code = "User Details Are Saved SuccessFully........!";
        }
        else{
            user.setEmail(userRegister.getEmail());
            user.setUserName(userRegister.getUserName());
            user.setPassword(userRegister.getPassword());

            userDetailsRepo.save(user);

            code = "User Details Are Updated SuccessFully........!";
        }
        return code;
    }
}
