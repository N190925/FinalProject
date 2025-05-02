package Website_tester.develop.service;

import Website_tester.develop.RequestClass.UserRegister;
import Website_tester.develop.RequestClass.UserVerification;


public interface UserDetailsService {
    String checkDetails(UserVerification userVerification);

    String saveUser(UserRegister userRegister);
}
