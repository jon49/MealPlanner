import { Create_New_Session, Hydrate } from "./sessions/sessions-tests.ts"
import { Register_bad_user, Register_user, Register_user_without_session_id } from "./users/users-tests.ts"
import { run } from "./shared/api-test-framework.ts"

const userTests = [
    Hydrate,
    Create_New_Session,
    Register_user,
    Register_bad_user,
    Register_user_without_session_id
]

run("http://localhost:55665", userTests)
