# VS Code Clean Architecture Extension

This VS Code extension helps you create a clean architecture project structure with a single command.

## Features

- Creates a predefined set of folders and files based on the Clean Architecture pattern.
- Simplifies the initial setup of a feature by generating necessary files with basic class declarations.

## Usage

1. **Install the Extension Locally**

   Follow these steps to package and install the extension locally:

   1. Navigate to the root directory of your extension project in the terminal.
   2. Run the following command to package the extension:
      ```sh
      vsce package
      ```
   3. Open VS Code and go to the extensions view by clicking the extensions icon in the sidebar or pressing `Ctrl+Shift+X`.
   4. Click on the three dots in the upper right corner of the extensions view and select `Install from VSIX...`.
   5. Select the `.vsix` file generated in step 2 to install the extension.

2. **Create a Clean Architecture Structure**

   1. Open a folder in VS Code where you want to create the project structure.
   2. Right-click on the folder in the Explorer and select `Create Project Structure`.
   3. Enter the feature name in `snake_case` when prompted.
   4. The extension will create the following structure:

      ```
      ├── data
      │   ├── data_source
      │   │   ├── <feature_name>_data_source.dart
      │   │   ├── <feature_name>_data_source_impl.dart
      │   ├── models
      │   │   └── <feature_name>_model.dart
      │   ├── repository
      │   │   └── <feature_name>_repository_impl.dart
      ├── domain
      │   ├── entities
      │   │   └── <feature_name>.dart
      │   ├── repository
      │   │   └── <feature_name>_repository.dart
      │   ├── usecases
      │   │   └── get_<feature_name>.dart
      ├── presentation
      │   ├── bloc
      │   │   ├── <feature_name>_cubit.dart
      │   │   ├── <feature_name>_state.dart
      │   ├── page
      │   │   └── <feature_name>_page.dart
      │   ├── widgets
      ```

## File Templates

The files created will contain basic class declarations. Below are examples of the content generated:

- `data/data_source/<feature_name>_data_source.dart`

  ```dart
  abstract interface class <FeatureName>DataSource {}
  ```

- `data/data_source/<feature_name>_data_source_impl.dart`

  ```dart
  import '<feature_name>_data_source.dart';
  class <FeatureName>DataSourceImpl implements <FeatureName>DataSource {}
  ```

- `data/models/<feature_name>_model.dart`

  ```dart
  class <FeatureName>Model {}
  ```

- `data/repository/<feature_name>_repository_impl.dart`

  ```dart
  import '../../domain/repository/<feature_name>_repository.dart';
  import '../data_source/<feature_name>_data_source.dart';

  class <FeatureName>RepositoryImpl implements <FeatureName>Repository {
    final <FeatureName>DataSource _dataSource;

    <FeatureName>RepositoryImpl({required <FeatureName>DataSource dataSource}) : _dataSource = dataSource;
  }
  ```

- `domain/entities/<feature_name>.dart`

  ```dart
  class <FeatureName> {}
  ```

- `domain/repository/<feature_name>_repository.dart`

  ```dart
  abstract interface class <FeatureName>Repository {}
  ```

- `presentation/bloc/<feature_name>_cubit.dart`

  ```dart
  import 'package:bloc/bloc.dart';
  import 'package:flutter/material.dart';

  import '../../domain/entities/<feature_name>.dart';

  part '<feature_name>_state.dart';

  class <FeatureName>Cubit extends Cubit<<FeatureName>State> {
    <FeatureName>Cubit() : super(<FeatureName>Initial());
  }
  ```

- `presentation/bloc/<feature_name>_state.dart`

  ```dart
  part of '<feature_name>_cubit.dart';

  @immutable
  sealed class <FeatureName>State {
    T when<T>({
      required T Function() initial,
      required T Function() loading,
      required T Function(<FeatureName> <featureName>) success,
      required T Function(String message) error,
    }) {
      if (this is <FeatureName>Initial) {
        return initial();
      } else if (this is <FeatureName>Loading) {
        return loading();
      } else if (this is <FeatureName>Error) {
        return error((this as <FeatureName>Error).message);
      }
      throw Exception('Unreachable');
    }

    T? maybeWhen<T>({
      T Function()? initial,
      T Function()? loading,
      T Function(<FeatureName> <featureName>)? success,
      T Function(String message)? error,
      required T? Function() orElse,
    }) {
      if (this is <FeatureName>Initial && initial != null) {
        return initial();
      } else if (this is <FeatureName>Loading && loading != null) {
        return loading();
      } else if (this is <FeatureName>Success && success != null) {
        return success((this as <FeatureName>Success).<featureName>);
      } else if (this is <FeatureName>Error && error != null) {
        return error((this as <FeatureName>Error).message);
      } else {
        return orElse();
      }
    }

    T? whenOrNull<T>({
      T Function()? initial,
      T Function()? loading,
      T Function(<FeatureName> <featureName>)? success,
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
  }

  final class <FeatureName>Initial extends <FeatureName>State {}

  final class <FeatureName>Loading extends <FeatureName>State {}

  final class <FeatureName>Success extends <FeatureName>State {
    final <FeatureName> <featureName>;

    <FeatureName>Success({required this.<featureName>});
  }

  final class <FeatureName>Error extends <FeatureName>State {
    final String message;

    <FeatureName>Error({required this.message});
  }
  ```

- `presentation/page/<feature_name>_page.dart`

  ```dart
  import 'package:flutter/material.dart';

  class <FeatureName>Page extends StatelessWidget {
    const <FeatureName>Page({super.key});

    @override
    Widget build(BuildContext context) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('<FeatureName>'),
        ),
        body: Container(),
      );
    }
  }
  ```

## Development

To make changes to the extension and see them reflected in VS Code:

1. Make your changes in the extension's source code.
2. Repackage the extension using `vsce package`.
3. Reinstall the updated `.vsix` file in VS Code.

## Release Notes

### 1.0.0

- Initial release of the Clean Architecture extension.
