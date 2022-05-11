/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const _ = require('lodash');
const chalk = require('chalk');
const fs = require('fs');
const utils = require('../utils');
const constants = require('../generator-constants');
const { CASSANDRA, COUCHBASE, MONGODB, NEO4J, SQL } = require('../../jdl/jhipster/database-types');
const { ELASTICSEARCH } = require('../../jdl/jhipster/search-engine-types');
const { MapperTypes, ServiceTypes } = require('../../jdl/jhipster/entity-options');
const { EHCACHE, CAFFEINE, INFINISPAN, REDIS } = require('../../jdl/jhipster/cache-types');
const { writeEntityCouchbaseFiles } = require('./files-couchbase');

const { MAPSTRUCT } = MapperTypes;
const { SERVICE_CLASS, SERVICE_IMPL } = ServiceTypes;

/* Constants use throughout */
const INTERPOLATE_REGEX = constants.INTERPOLATE_REGEX;
const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const TEST_DIR = constants.TEST_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const serverFiles = {
  dbChangelog: [
    {
      condition: generator => generator.databaseType === CASSANDRA && !generator.skipDbChangelog,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/cql/changelog/added_entity.cql',
          renameTo: generator => `config/cql/changelog/${generator.changelogDate}_added_entity_${generator.entityClass}.cql`,
        },
      ],
    },
  ],
  server: [
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        /*
        {
          file: 'package/domain/Entity.java.jhi',
          renameTo: generator => `${generator.packageFolder}/domain/${generator.persistClass}.java.jhi`,
        },
        {
          file: 'package/domain/Entity.java.jhi.javax_validation',
          renameTo: generator => `${generator.packageFolder}/domain/${generator.persistClass}.java.jhi.javax_validation`,
        },*/

        /** Entity **/
        {
          file: 'package/adapter/outbound/persistence/repository/model/Entity.java.jhi',
          renameTo: generator => `${generator.packageFolder}/adapter/outbound/persistence/repository/model/${generator.persistClass}.java.jhi`,
        },
        {
          file: 'package/adapter/outbound/persistence/repository/model/Entity.java.jhi.javax_validation',
          renameTo: generator => `${generator.packageFolder}/adapter/outbound/persistence/repository/model/${generator.persistClass}.java.jhi.javax_validation`,
        },
        {
          file: 'package/adapter/outbound/persistence/repository/model/Entity.java.jhi.javax_persistence',
          renameTo: generator => `${generator.packageFolder}/adapter/outbound/persistence/repository/model/${generator.persistClass}.java.jhi.javax_persistence`,
        },
        /** Repository **/
        {
          file: 'package/adapter/outbound/persistence/repository/EntityRepository.java',
          renameTo: generator => `${generator.packageFolder}/adapter/outbound/persistence/repository/${generator.persistClass}Repository.java`,
        },
        /** Persistence Impl **/ 
        {
          file: 'package/adapter/outbound/persistence/EntityQueryServicePersistenceImpl.java',
          renameTo: generator => `${generator.packageFolder}/adapter/outbound/persistence/${generator.persistClass}QueryServicePersistenceImpl.java`,
        },
        {
          file: 'package/adapter/outbound/persistence/EntityServicePersistenceImpl.java',
          renameTo: generator => `${generator.packageFolder}/adapter/outbound/persistence/${generator.persistClass}ServicePersistenceImpl.java`,
        },
        /** Entity Mapper **/
        {
          file: 'package/adapter/outbound/persistence/mapper/EntityMapper.java',
          renameTo: generator => `${generator.packageFolder}/adapter/outbound/persistence/mapper/${generator.persistClass}EntityMapper.java`,
        },
        /** Application Service Impl**/
        {
          file: 'package/application/EntityServiceImpl.java',
          renameTo: generator => `${generator.packageFolder}/application/${generator.persistClass}ServiceImpl.java`,
        },
         /** Application Mapper**/
        {
          file: 'package/application/mapper/DTOMapper.java',
          renameTo: generator => `${generator.packageFolder}/application/mapper/${generator.persistClass}Mapper.java`,
        },    
        {
          file: 'package/application/mapper/DTOInsertMapper.java',
          renameTo: generator => `${generator.packageFolder}/application/mapper/${generator.persistClass}InsertMapper.java`,
        },
        {
          file: 'package/application/mapper/DTOUpdateMapper.java',
          renameTo: generator => `${generator.packageFolder}/application/mapper/${generator.persistClass}UpdateMapper.java`,
        },
        /** Persistence interface **/
        {
          file: 'package/application/port/outbound/persistence/EntityQueryServicePersistence.java',
          renameTo: generator => `${generator.packageFolder}/application/port/outbound/persistence/${generator.persistClass}QueryServicePersistence.java`,
        },
	    {
          file: 'package/application/port/outbound/persistence/EntityServicePersistence.java',
          renameTo: generator => `${generator.packageFolder}/application/port/outbound/persistence/${generator.persistClass}ServicePersistence.java`,
        },   
        /** Application Model **/
        {
         file: 'package/application/model/EntityModel.java.jhi',
         renameTo: generator => `${generator.packageFolder}/application/model/${generator.entityClass}Model.java.jhi`,
        },
        

      ],
    },
    /** REST Controller **/
    {
      condition: generator => !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/adapter/inbound/rest/EntityResource.java',
          renameTo: generator => `${generator.packageFolder}/adapter/inbound/rest/${generator.entityClass}Resource.java`,
        },
      ],
    },
    /** Application port **/
    {      
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        /** ------PORT INBOUND------ **/

        /** Service Interface **/
        {
          file: 'package/application/port/inbound/service/EntityService.java',
          renameTo: generator => `${generator.packageFolder}/application/port/inbound/service/${generator.persistClass}Service.java`,
        },
        /** Applicatin DTO**/
        {
          file: 'package/application/port/inbound/service/model/EntityDTO.java.jhi',
          renameTo: generator => `${generator.packageFolder}/application/port/inbound/service/model/${generator.persistClass}DTO.java.jhi`,
        },  
        {
          file: 'package/application/port/inbound/service/model/EntityInsertDTO.java.jhi',
          renameTo: generator => `${generator.packageFolder}/application/port/inbound/service/model/${generator.persistClass}InsertDTO.java.jhi`,
        }, 
        {
          file: 'package/application/port/inbound/service/model/Entity.java.jhi.javax_validation',
          renameTo: generator => `${generator.packageFolder}/application/port/inbound/service/model/${generator.persistClass}InsertDTO.java.jhi.javax_validation`,
        },   
        {
          file: 'package/application/port/inbound/service/model/EntityUpdateDTO.java.jhi',
          renameTo: generator => `${generator.packageFolder}/application/port/inbound/service/model/${generator.persistClass}UpdateDTO.java.jhi`,
        },        {
          file: 'package/application/port/inbound/service/model/Entity.java.jhi.javax_validation',
          renameTo: generator => `${generator.packageFolder}/application/port/inbound/service/model/${generator.persistClass}UpdateDTO.java.jhi.javax_validation`,
        }, 
        {
          file: 'package/application/port/inbound/service/model/EntityCriteria.java',
          renameTo: generator => `${generator.packageFolder}/application/port/inbound/service/model/${generator.persistClass}Criteria.java.jhi`,
        },               

       /** ------PORT OUTBOUND------ **/
       /*{
         file: 'package/application/port/outbound/persistence/EntityQueryServicePersistence.java',
         renameTo: generator => `${generator.packageFolder}/application/port/outbound/persistence/${generator.entityClass}QueryServicePersistence.java`,
       },
       {
         file: 'package/application/port/outbound/persistence/EntityServicePersistence.java',
         renameTo: generator => `${generator.packageFolder}/application/port/outbound/persistence/${generator.entityClass}ServicePersistence.java`,
       },*/
      ],
    },

    /** Application Service Impl **/
    {      
      path: SERVER_MAIN_SRC_DIR,
      templates: [       
        {
          file: 'package/application/EntityServiceImpl.java',
          renameTo: generator => `${generator.packageFolder}/service/impl/${generator.entityClass}ServiceImpl.java`,
        }
      ],
    },

/*
  
    {
      condition: generator => generator.databaseTypeSql && generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.spring_data_reactive',
          renameTo: generator => `${generator.packageFolder}/domain/${generator.persistClass}.java.jhi.spring_data_reactive`,
        },
      ],
    },
    {
      condition: generator => generator.databaseTypeCassandra,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.spring_data_cassandra',
          renameTo: generator => `${generator.packageFolder}/domain/${generator.persistClass}.java.jhi.spring_data_cassandra`,
        },
      ],
    },
    {
      condition: generator => generator.databaseTypeNeo4j,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.spring_data_neo4j',
          renameTo: generator => `${generator.packageFolder}/domain/${generator.persistClass}.java.jhi.spring_data_neo4j`,
        },
      ],
    },

    {
      condition: generator => generator.databaseTypeSql && !generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.javax_persistence',
          renameTo: generator => `${generator.packageFolder}/domain/${generator.persistClass}.java.jhi.javax_persistence`,
        },
      ],
    },
    {
      condition: generator => generator.databaseTypeMongodb,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.spring_data_mongodb',
          renameTo: generator => `${generator.packageFolder}/domain/${generator.persistClass}.java.jhi.spring_data_mongodb`,
        },
      ],
    },
    {
      condition: generator => generator.databaseTypeSql && !generator.reactive && generator.enableHibernateCache,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.hibernate_cache',
          renameTo: generator => `${generator.packageFolder}/domain/${generator.persistClass}.java.jhi.hibernate_cache`,
        },
      ],
    },
    {
      condition: generator => generator.searchEngineElasticsearch,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.elastic_search',
          renameTo: generator => `${generator.packageFolder}/domain/${generator.persistClass}.java.jhi.elastic_search`,
        },
      ],
    },
    
    {
      condition: generator => generator.jpaMetamodelFiltering,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/criteria/EntityCriteria.java',
          renameTo: generator => `${generator.packageFolder}/service/criteria/${generator.entityClass}Criteria.java`,
        },
        {
          file: 'package/service/EntityQueryService.java',
          renameTo: generator => `${generator.packageFolder}/service/${generator.entityClass}QueryService.java`,
        },
      ],
    },
    {
      condition: generator => generator.searchEngine === ELASTICSEARCH && !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/search/EntitySearchRepository.java',
          renameTo: generator => `${generator.packageFolder}/repository/search/${generator.entityClass}SearchRepository.java`,
        },
      ],
    },
    {
      condition: generator => !generator.reactive && !generator.embedded && generator.databaseType !== COUCHBASE,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/EntityRepository.java',
          renameTo: generator => `${generator.packageFolder}/repository/${generator.entityClass}Repository.java`,
        },
      ],
    },
    {
      condition: generator => generator.reactive && !generator.embedded && generator.databaseType !== COUCHBASE,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/EntityRepository_reactive.java',
          renameTo: generator => `${generator.packageFolder}/repository/${generator.entityClass}Repository.java`,
        },
      ],
    },
    {
      condition: generator => generator.reactive && generator.databaseType === SQL && !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/EntityRepositoryInternalImpl_reactive.java',
          renameTo: generator => `${generator.packageFolder}/repository/${generator.entityClass}RepositoryInternalImpl.java`,
        },
        {
          file: 'package/repository/rowmapper/EntityRowMapper.java',
          renameTo: generator => `${generator.packageFolder}/repository/rowmapper/${generator.entityClass}RowMapper.java`,
        },
      ],
    },
    
    {
      condition: generator => generator.service === SERVICE_CLASS && !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/impl/EntityServiceImpl.java',
          renameTo: generator => `${generator.packageFolder}/service/${generator.entityClass}Service.java`,
        },
      ],
    },
    {
      condition: generator => generator.dto === MAPSTRUCT,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/dto/EntityDTO.java',
          renameTo: generator => `${generator.packageFolder}/service/dto/${generator.asDto(generator.entityClass)}.java`,
        },
        {
          file: 'package/service/mapper/BaseEntityMapper.java',
          renameTo: generator => `${generator.packageFolder}/service/mapper/EntityMapper.java`,
        },
        {
          file: 'package/service/mapper/EntityMapper.java',
          renameTo: generator => `${generator.packageFolder}/service/mapper/${generator.entityClass}Mapper.java`,
        },
      ],
    },
  ],
  test: [
    {
      condition: generator => !generator.embedded,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/EntityResourceIT.java',
          options: {
            context: {
              _,
              chalkRed: chalk.red,
              fs,
              SERVER_TEST_SRC_DIR,
            },
          },
          renameTo: generator => `${generator.packageFolder}/web/rest/${generator.entityClass}ResourceIT.java`,
        },
      ],
    },
    {
      condition: generator => generator.searchEngine === ELASTICSEARCH && !generator.embedded,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/repository/search/EntitySearchRepositoryMockConfiguration.java',
          renameTo: generator =>
            `${generator.packageFolder}/repository/search/${generator.entityClass}SearchRepositoryMockConfiguration.java`,
        },
      ],
    },
    {
      condition: generator => generator.gatlingTests,
      path: TEST_DIR,
      templates: [
        {
          file: 'gatling/user-files/simulations/EntityGatlingTest.scala',
          options: { interpolate: INTERPOLATE_REGEX },
          renameTo: generator => `gatling/user-files/simulations/${generator.entityClass}GatlingTest.scala`,
        },
      ],
    },
    {
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/domain/EntityTest.java',
          renameTo: generator => `${generator.packageFolder}/domain/${generator.persistClass}Test.java`,
        },
      ],
    },
    {
      condition: generator => generator.dto === MAPSTRUCT,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/service/dto/EntityDTOTest.java',
          renameTo: generator => `${generator.packageFolder}/service/dto/${generator.asDto(generator.entityClass)}Test.java`,
        },
      ],
    },
    {
      condition: generator => generator.dto === MAPSTRUCT && [SQL, MONGODB, COUCHBASE, NEO4J].includes(generator.databaseType),
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/service/mapper/EntityMapperTest.java',
          renameTo: generator => `${generator.packageFolder}/service/mapper/${generator.entityClass}MapperTest.java`,
        },
      ],
    },*/
  ],
};


module.exports = {
  writeFiles,
  serverFiles,
  customizeFiles,
};

function writeFiles() {
  return {
    writeServerFiles() {
      if (this.skipServer) return undefined;

      // write server side files
      if (this.reactive) {
        return this.writeFilesToDisk(serverFiles, ['reactive', '']);
      }
      return this.writeFilesToDisk(serverFiles);
    },

    writeEnumFiles() {
      this.fields.forEach(field => {
        if (!field.fieldIsEnum) {
          return;
        }
        const fieldType = field.fieldType;
        const enumInfo = {
          ...utils.getEnumInfo(field, this.clientRootFolder),
          frontendAppName: this.frontendAppName,
          packageName: this.packageName,
        };
        // eslint-disable-next-line no-console
        if (!this.skipServer) {
          const pathToTemplateFile = `${this.fetchFromInstalledJHipster(
            'entity-server/templates'
          )}/${SERVER_MAIN_SRC_DIR}package/adapter/outbound/persistence/repository/model/enumeration/Enum.java.ejs`;
          this.template(
            pathToTemplateFile,
            `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/adapter/outbound/persistence/repository/model/enumeration/${fieldType}.java`,
            this,
            {},
            enumInfo
          );
        }
      });
    },
    ...writeEntityCouchbaseFiles(),
  };
}

function customizeFiles() {
  if (this.databaseType === SQL) {
    if ([EHCACHE, CAFFEINE, INFINISPAN, REDIS].includes(this.cacheProvider) && this.enableHibernateCache) {
      this.addEntityToCache(this.asEntity(this.entityClass), this.relationships, this.packageName, this.packageFolder, this.cacheProvider);
    }
  }
}
