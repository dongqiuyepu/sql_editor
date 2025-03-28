/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to you under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.calcite.example.avatica;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Test that demonstrates how to connect to the Avatica server
 * and execute queries against CSV data.
 */
public class SimpleCalciteAvaticaTest {
    private static SimpleCalciteAvaticaServer server;
    private static String jdbcUrl;
    
    @BeforeClass
    public static void startServer() throws Exception {
        server = new SimpleCalciteAvaticaServer();
        server.start();
        jdbcUrl = server.getJdbcUrl();
        System.out.println("Server started at " + jdbcUrl);
    }
    
    @AfterClass
    public static void stopServer() {
        if (server != null) {
            server.stop();
        }
    }
    
    @Test
    public void testSimpleQuery() throws Exception {
        try (Connection connection = DriverManager.getConnection(jdbcUrl);
             Statement statement = connection.createStatement()) {
            
            // Query the SALES schema
            ResultSet rs = statement.executeQuery(
                "SELECT DEPTNO, NAME FROM DEPTS");
            
            List<String> results = new ArrayList<>();
            while (rs.next()) {
                int empno = rs.getInt(1);
                String name = rs.getString(2);
                results.add(empno + ":" + name);
            }
            
            // Verify we got the expected results
            assertEquals(3, results.size());
            // assertTrue(results.contains("100:Fred"));
            // assertTrue(results.contains("110:Eric"));
            // assertTrue(results.contains("150:Sebastian"));
            // assertTrue(results.contains("200:Theodore"));
        }
    }
}
