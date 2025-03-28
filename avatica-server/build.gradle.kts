plugins {
    kotlin("jvm")
    id("java-library")
}

dependencies {
    implementation(project(":core"))
    implementation(project(":example:csv"))  // Add CSV adapter dependency
    implementation("org.apache.calcite.avatica:avatica-core")
    implementation("org.apache.calcite.avatica:avatica-server")
    
    // For testing
    testImplementation("junit:junit")
    testImplementation("org.hamcrest:hamcrest")
    
    // Add SLF4J implementation
    testRuntimeOnly("org.slf4j:slf4j-simple:1.7.30")
}

tasks.test {
    useJUnit()
    testLogging {
        events("passed", "skipped", "failed")
    }
}
