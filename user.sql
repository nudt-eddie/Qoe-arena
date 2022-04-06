-- `user`.results definition

CREATE TABLE `results` (
  `idname` varchar(100) DEFAULT NULL,
  `loadtime` varchar(100) DEFAULT NULL,
  `result_txt` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `result_html` longtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- `user`.student definition

CREATE TABLE `student` (
  `userName` varchar(100) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;