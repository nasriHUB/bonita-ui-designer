/**
 * Copyright (C) 2015 Bonitasoft S.A.
 * Bonitasoft, 32 rue Gustave Eiffel - 38000 Grenoble
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2.0 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
package org.bonitasoft.web.designer.repository;

import static java.lang.String.format;
import static java.nio.file.Files.exists;
import static java.nio.file.Files.newDirectoryStream;
import static java.nio.file.Files.readAllBytes;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.bonitasoft.web.designer.model.Identifiable;
import org.bonitasoft.web.designer.model.JacksonObjectMapper;
import org.bonitasoft.web.designer.model.JsonViewPersistence;
import org.bonitasoft.web.designer.repository.exception.JsonReadException;
import org.bonitasoft.web.designer.repository.exception.NotFoundException;
import org.bonitasoft.web.designer.repository.exception.RepositoryException;

/**
 * Load a component
 */
public abstract class AbstractLoader<T extends Identifiable> implements Loader<T> {

    private JacksonObjectMapper objectMapper;
    private Class<T> type;

    public AbstractLoader(JacksonObjectMapper objectMapper, Class<T> type) {
        this.objectMapper = objectMapper;
        this.type = type;
    }

    public T get(Path path) {
        try {
            T artifact = objectMapper.fromJson(readAllBytes(path), type);
            Path metadata = path.getParent().getParent().resolve(format(".metadata/%s.json", path.getParent().getFileName()));
            if (exists(metadata)) {
                artifact = objectMapper.assign(artifact, readAllBytes(metadata));
            }
            return artifact;
        } catch (JsonProcessingException e) {
            throw new JsonReadException(format("Could not read json file [%s]", path.getFileName()), e);
        } catch (NoSuchFileException e) {
            throw new NotFoundException(format("Could not load component, unexpected structure in the file [%s]", path.getFileName()));
        } catch (IOException e) {
            throw new RepositoryException(format("Error while getting component (on file [%s])", path.getFileName()), e);
        }
    }

    @Override
    public List<T> getAll(Path directory) throws IOException {
        return getAll(directory, "[!.]*");
    }

    protected List<T> getAll(Path directory, String glob) throws IOException {
        List<T> objects = new ArrayList<>();

        try (DirectoryStream<Path> directoryStream = newDirectoryStream(directory, glob)) {
            for (Path path : directoryStream) {
                String id = getComponentId(path);
                objects.add(get(directory.resolve(format("%s/%s.json", id, id))));
            }
        }
        return objects;
    }

    @Override
    public T load(Path path) {
        try {
            return objectMapper.fromJson(readAllBytes(path), type, JsonViewPersistence.class);
        } catch (JsonProcessingException e) {
            throw new JsonReadException(format("Could not read json file [%s]", path.getFileName()), e);
        } catch (NoSuchFileException e) {
            throw new NotFoundException(format("Could not load component, unexpected structure in the file [%s]", path.getFileName()));
        } catch (IOException e) {
            throw new RepositoryException(format("Error while getting component (on file [%s])", path.getFileName()), e);
        }
    }

    public Path resolve(Path directory, String id) {
        return directory.resolve(format("%s/%s.json", id, id));
    }

    private String getComponentId(Path path) {
        return path.getFileName().toString().replaceAll("\\.\\w+", "");
    }

    public List<T> loadAll(Path directory) throws IOException {
        return loadAll(directory, "[!.]*");
    }

    protected List<T> loadAll(Path directory, String glob) throws IOException {
        List<T> objects = new ArrayList<>();

        try (DirectoryStream<Path> directoryStream = newDirectoryStream(directory, glob)) {
            for (Path path : directoryStream) {
                String id = getComponentId(path);
                objects.add(load(resolve(directory, id)));
            }
        }
        return objects;
    }
}
