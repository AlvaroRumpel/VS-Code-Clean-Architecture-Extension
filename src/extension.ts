import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.create', async (uri: vscode.Uri) => {
    if (!uri.fsPath) {
      vscode.window.showErrorMessage('Please select a folder first.');
      return;
    }


    const input = await vscode.window.showInputBox({
      prompt: 'Enter feature name to create (snake_case)',
      placeHolder: 'clean_arch'
    });

    if (!input) {
      vscode.window.showErrorMessage('No feature name provided.');
      return;
    }

    const rootPath = `${uri.fsPath}/${input}`;

    // Convert snake_case to PascalCase for class names
    const featureName = input.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');

    const data = 'data';
    const dataSources = `${data}/data_sources`;
    const models = `${data}/models`;
    const repositoriesData = `${data}/repositories`;

    const domain = 'domain';
    const entities = `${domain}/entities`;
    const repositoriesDomain = `${domain}/repositories`;
    const usecases = `${domain}/usecases`;

    const presentation = 'presentation';
    const bloc = `${presentation}/bloc`;
    const page = `${presentation}/page`;
    const widgets = `${presentation}/widgets`;


    const foldersToCreate = [
      dataSources,
      models,
      repositoriesData,
      entities,
      repositoriesDomain,
      usecases,
      bloc,
      page,
      widgets,
    ];

    const filesToCreate = [
      { path: `${dataSources}/${input}_data_source.dart`, content: `${_createDataSource(featureName)}` },
      { path: `${dataSources}/${input}_data_source_impl.dart`, content: `${_createDataSourceImpl(input, featureName)}` },
      { path: `${models}/${input}_model.dart`, content: `${_createModel(featureName)}` },
      { path: `${repositoriesData}/${input}_repository_impl.dart`, content: `${_createRepositoryImpl(input, featureName)}` },
      { path: `${entities}/${input}.dart`, content: `class ${featureName} {}` },
      { path: `${repositoriesDomain}/${input}_repository.dart`, content: `${_createRepository(featureName)}` },
      { path: `${bloc}/${input}_cubit.dart`, content: `${_createCubit(input, featureName)}` },
      { path: `${bloc}/${input}_state.dart`, content: `${_createState(input, featureName)}` },
      { path: `${page}/${input}_page.dart`, content: `${_createPage(featureName)}` },
    ];

    try {
      foldersToCreate.forEach(folder => {
        const folderPath = path.join(rootPath, folder);
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
      });

      filesToCreate.forEach(file => {
        const filePath = path.join(rootPath, file.path);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, file.content);
        }
      });

      vscode.window.showInformationMessage('Clean architecture structure created successfully!');
    } catch (error) {
      vscode.window.showErrorMessage('Failed to create project structure');
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() { }

function _createDataSource(name: String): String {
  return `abstract interface class ${name}DataSource {}`;
}

function _createDataSourceImpl(file: String, name: String): String {
  return `import '${file}_data_source.dart';
	
class ${name}DataSourceImpl implements ${name}DataSource {}`;
}

function _createModel(name: String): String {
  return `class ${name}Model {}`;
}

function _createRepository(name: String): String {
  return `abstract interface class ${name}Repository {}`;
}

function _createRepositoryImpl(file: String, name: String): String {
  return `import '../../domain/repositories/${file}_repository.dart';
import '../data_sources/${file}_data_source.dart';

class ${name}RepositoryImpl implements ${name}Repository{
  final ${name}DataSource _dataSource;

  ${name}RepositoryImpl({required ${name}DataSource dataSource}) : _dataSource = dataSource;
}`;
}

function _createPage(name: String): String {
  return `import 'package:flutter/material.dart';

class ${name}Page extends StatelessWidget {
  const ${name}Page({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('${name}'),
      ),
      body: Container(),
    );
  }
}`;
}

function _createCubit(file: String, name: string): String {
  return `import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';

import '../../domain/entities/${file}.dart';

part '${file}_state.dart';

class ${name}Cubit extends Cubit<${name}State> {
  ${name}Cubit() : super(${name}Initial());
}
`;
}

function _createState(file: String, name: string): String {
  return `part of '${file}_cubit.dart';

@immutable
sealed class ${name}State extends Equatable {
  const ${name}State();

  T when<T>({
    required T Function() initial,
    required T Function() loading,
    required T Function(${name} ${name[0].toLowerCase() + name.slice(1)}) success,
    required T Function(String message) error,
  }) {
    if (this is ${name}Initial) {
      return initial();
    } else if (this is ${name}Loading) {
      return loading();
    } else if (this is ${name}Success) {
      return success((this as ${name}Success).${name[0].toLowerCase() + name.slice(1)});
    } else if (this is ${name}Error) {
      return error((this as ${name}Error).message);
    }
    throw Exception('Unreachable');
  }

  T? maybeWhen<T>({
    T Function()? initial,
    T Function()? loading,
    T Function(${name} ${name[0].toLowerCase() + name.slice(1)})? success,
    T Function(String message)? error,
    required T? Function() orElse,
  }) {
    if (this is ${name}Initial && initial != null) {
      return initial();
    } else if (this is ${name}Loading && loading != null) {
      return loading();
    } else if (this is ${name}Success && success != null) {
      return success((this as ${name}Success).${name[0].toLowerCase() + name.slice(1)});
    } else if (this is ${name}Error && error != null) {
      return error((this as ${name}Error).message);
    } else {
      return orElse();
    }
  }

  T? whenOrNull<T>({
    T Function()? initial,
    T Function()? loading,
    T Function(${name} ${name[0].toLowerCase() + name.slice(1)})? success,
    T Function(String message)? error,
  }) {
    return maybeWhen(
      initial: initial,
      loading: loading,
      success: success,
      error: error,
      orElse: () => null,
    );
  }

  @override
  List<Object?> get props => [];
}

final class ${name}Initial extends ${name}State {}

final class ${name}Loading extends ${name}State {}

final class ${name}Success extends ${name}State {
  final ${name} ${name[0].toLowerCase() + name.slice(1)};

  const ${name}Success({required this.${name[0].toLowerCase() + name.slice(1)}});

  @override
  List<Object?> get props => [${name[0].toLowerCase() + name.slice(1)}];
}

final class ${name}Error extends ${name}State {
  final String message;

  const ${name}Error({required this.message});

  @override
  List<Object?> get props => [message];
}
`;
}