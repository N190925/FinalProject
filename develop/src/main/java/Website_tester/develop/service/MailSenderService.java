package Website_tester.develop.service;

import Website_tester.develop.RequestClass.Encrypted;

public interface MailSenderService {

    String generateCode(String email, String number) throws Exception;

    String verifyCode(Encrypted encrypted);
}
