package Website_tester.develop.service;

import Website_tester.develop.repository.UserDetailsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class DownloadServiceImpl implements DownloadService{

    @Autowired
    private UserDetailsRepo userDetailsRepo;

    @Override
    public File userVerification() {

        System.out.println("Implementation Started Now.........");
        return zipFile();
    }

    private File zipFile() {

        String filePath = "src/tester.zip";
        System.out.println("Zip File Generated and Download......!");
        return new File(filePath);
    }
}
