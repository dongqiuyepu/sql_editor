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

import org.apache.calcite.avatica.Meta;
import org.apache.calcite.avatica.jdbc.JdbcMeta;
import org.apache.calcite.avatica.remote.Driver.Serialization;
import org.apache.calcite.avatica.server.AvaticaProtobufHandler;
import org.apache.calcite.avatica.server.HttpServer;
import org.apache.calcite.avatica.server.Main;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;
import java.util.List;
import java.util.Properties;

/**
 * Simple implementation of an Avatica server that exposes a Calcite model
 * through JDBC.
 */
public class SimpleCalciteAvaticaServer {
    private HttpServer server;
    
    public void start() throws Exception {
        final String[] args = {SimpleMetaFactory.class.getName()};
        this.server = Main.start(args, 0, AvaticaProtobufHandler::new);
    }
    
    public String getJdbcUrl() {
        return "jdbc:avatica:remote:url=http://localhost:" + server.getPort()
            + ";serialization=" + Serialization.PROTOBUF.name();
    }
    
    public void stop() {
        if (server != null) {
            server.stop();
        }
    }
    
    /** Factory that creates a Calcite-specific JDBC meta implementation. */
    public static class SimpleMetaFactory implements Meta.Factory {
        private static volatile JdbcMeta instance = null;
        
        private static JdbcMeta getInstance() {
            if (instance == null) {
                synchronized (SimpleMetaFactory.class) {
                    if (instance == null) {
                        try {
                            Properties info = new Properties();
                            String model = loadModelFromResource();
                            
                            // Get the base directory for CSV files
                            URL salesUrl = SimpleMetaFactory.class.getResource("/sales");
                            if (salesUrl == null) {
                                throw new IOException("Could not find /sales directory in resources");
                            }
                            File salesDir = new File(salesUrl.getFile());
                            
                            // Replace the directory placeholder with actual path
                            model = model.replace("\"directory\": \"sales\"",
                                "\"directory\": \"" + salesDir.getAbsolutePath() + "\"");
                            
                            info.setProperty("model", "inline:" + model);
                            instance = new JdbcMeta("jdbc:calcite:", info);
                        } catch (SQLException | IOException e) {
                            throw new RuntimeException(e);
                        }
                    }
                }
            }
            return instance;
        }
        
        private static String loadModelFromResource() throws IOException {
            try (InputStream in = SimpleMetaFactory.class.getResourceAsStream("/model.json")) {
                if (in == null) {
                    throw new IOException("Could not find model.json in resources");
                }
                byte[] bytes = in.readAllBytes();
                return new String(bytes, StandardCharsets.UTF_8);
            }
        }
        
        @Override 
        public Meta create(List<String> args) {
            return getInstance();
        }
    }
    
    public static void main(String[] args) throws Exception {
        SimpleCalciteAvaticaServer server = new SimpleCalciteAvaticaServer();
        server.start();
        System.out.println("Server started. JDBC URL: " + server.getJdbcUrl());
        
        // Keep the server running
        Thread.currentThread().join();
    }
}
