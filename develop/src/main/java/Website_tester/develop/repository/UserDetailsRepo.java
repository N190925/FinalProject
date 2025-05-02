package Website_tester.develop.repository;

import Website_tester.develop.model.RegisterDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserDetailsRepo extends JpaRepository<RegisterDetails, Integer> {

    @Query(nativeQuery = true, value = "select name from public.registerdetails where name = :userName;")
    String findByUser(String userName);

    @Query(nativeQuery = true, value = "select password from public.registerdetails where password  = :password;")
    String findByPass(String password);

    RegisterDetails findByEmail(String userName);
}
