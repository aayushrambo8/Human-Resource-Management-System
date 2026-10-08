package com.aayush.hrms;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.http.MediaType;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HrmsBackendApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Test
	void authenticationAndBiometricFlow() throws Exception {
		mockMvc.perform(get("/api/health"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("ok"));

		mockMvc.perform(options("/api/auth/login")
						.header("Origin", "http://localhost:5173")
						.header("Access-Control-Request-Method", "POST")
						.header("Access-Control-Request-Headers", "content-type"))
				.andExpect(status().isOk())
				.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers
						.header().string("Access-Control-Allow-Origin", "http://localhost:5173"));

		mockMvc.perform(get("/api/employees"))
				.andExpect(status().isUnauthorized());

		mockMvc.perform(post("/api/auth/bootstrap")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"email":"admin@test.local","password":"test-password-long-enough"}
								"""))
				.andExpect(status().isUnauthorized());

		String tokenResponse = mockMvc.perform(post("/api/auth/bootstrap")
						.header("X-Bootstrap-Token", "test-bootstrap-token-that-is-at-least-32-bytes")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"email":"admin@test.local","password":"test-password-long-enough"}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.roles[0]").value("ADMIN"))
				.andReturn()
				.getResponse()
				.getContentAsString();
		String accessToken = objectMapper.readTree(tokenResponse)
				.get("accessToken")
				.asText();
		String refreshToken = objectMapper.readTree(tokenResponse)
				.get("refreshToken")
				.asText();

		mockMvc.perform(get("/api/employees")
						.header("Authorization", "Bearer " + accessToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].employeeCode").value("EMP001"));

		mockMvc.perform(post("/api/biometric/attendance")
						.header("X-Device-Token", "change-me-device-token")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"deviceCode":"BIO-001","employeeCode":"UNKNOWN-9",
								 "punchTime":"2026-10-08T09:15:00Z","direction":"IN","rawPayload":"audit-test"}
								"""))
				.andExpect(status().isAccepted())
				.andExpect(jsonPath("$.status").value("UNKNOWN_EMPLOYEE"))
				.andExpect(jsonPath("$.attendanceRecordId").doesNotExist());

		mockMvc.perform(post("/api/biometric/attendance")
						.header("X-Device-Token", "change-me-device-token")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"deviceCode":"BIO-001","employeeCode":"EMP001",
								 "punchTime":"2026-10-08T09:20:00Z","direction":"OUT"}
								"""))
				.andExpect(status().isAccepted())
				.andExpect(jsonPath("$.status").value("ACCEPTED"))
				.andExpect(jsonPath("$.attendanceRecordId").isNotEmpty());

		mockMvc.perform(get("/api/biometric/logs")
						.header("Authorization", "Bearer " + accessToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[1].employeeCode").value("UNKNOWN-9"))
				.andExpect(jsonPath("$.content[1].rawPayload").value("audit-test"));

		mockMvc.perform(get("/api/attendance")
						.header("Authorization", "Bearer " + accessToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(1));

		mockMvc.perform(post("/api/auth/bootstrap")
						.header("X-Bootstrap-Token", "test-bootstrap-token-that-is-at-least-32-bytes")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"email":"second@test.local","password":"another-long-password"}
								"""))
				.andExpect(status().isConflict());

		mockMvc.perform(post("/api/auth/refresh")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"refreshToken\":\"" + refreshToken + "\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.refreshToken").isNotEmpty());

		mockMvc.perform(post("/api/auth/refresh")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"refreshToken\":\"" + refreshToken + "\"}"))
				.andExpect(status().isUnauthorized());

		mockMvc.perform(post("/api/employees")
						.header("Authorization", "Bearer " + accessToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"employeeCode":"EMP002","firstName":"New","lastName":"Person",
								 "email":"new.person@test.local","status":"ACTIVE"}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.employeeCode").value("EMP002"));

		mockMvc.perform(post("/api/departments")
						.header("Authorization", "Bearer " + accessToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"companyId":"11111111-1111-1111-1111-111111111111",
								 "code":"IT","name":"Information Technology"}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.code").value("IT"));

		mockMvc.perform(post("/api/accounts")
						.header("Authorization", "Bearer " + accessToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"email":"employee@test.local","password":"employee-password-long",
								 "roles":["EMPLOYEE"],"employeeCode":"EMP001"}
								"""))
				.andExpect(status().isCreated());

		String employeeLogin = mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"email":"employee@test.local","password":"employee-password-long"}
								"""))
				.andExpect(status().isOk())
				.andReturn()
				.getResponse()
				.getContentAsString();
		String employeeToken = objectMapper.readTree(employeeLogin).get("accessToken").asText();

		mockMvc.perform(get("/api/employees")
						.header("Authorization", "Bearer " + employeeToken))
				.andExpect(status().isForbidden());

		String leaveResponse = mockMvc.perform(post("/api/leaves")
						.header("Authorization", "Bearer " + employeeToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"startDate":"2026-10-20","endDate":"2026-10-21","reason":"Personal leave"}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.status").value("PENDING"))
				.andReturn()
				.getResponse()
				.getContentAsString();
		String leaveId = objectMapper.readTree(leaveResponse).get("id").asText();

		mockMvc.perform(get("/api/leaves")
						.header("Authorization", "Bearer " + employeeToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].employeeCode").value("EMP001"));

		mockMvc.perform(patch("/api/leaves/" + leaveId + "/decision")
						.header("Authorization", "Bearer " + accessToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"status\":\"APPROVED\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("APPROVED"));
	}

}
